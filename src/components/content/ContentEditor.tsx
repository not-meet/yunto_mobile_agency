import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiAssistBar, type Suggestion } from '@/components/content/AiAssistBar';
import { AssistantTabs } from '@/components/content/AssistantTabs';
import { BrandCollabCard, ShiftCard } from '@/components/content/BrandCollabCard';
import { EditorHeader, type SaveState } from '@/components/content/EditorHeader';
import { DISCLOSURES, platformLabel, scriptKind, scriptType } from '@/components/content/labels';
import { MediaCard } from '@/components/content/MediaCard';
import { ScheduleCard } from '@/components/content/ScheduleCard';
import { assist, type Intent, intentFor, PROMPT_INTENT } from '@/components/content/scriptAssist';
import { ScriptCard, type ScriptMode } from '@/components/content/ScriptCard';
import { ago, markScript, type Marked } from '@/components/content/scriptMarks';
import { SegmentTopicsCard } from '@/components/content/SegmentTopicsCard';
import {
  useDeleteContentMedia,
  useReorderContentMedia,
  useSaveContent,
  useUploadContentMedia,
} from '@/hooks/useContentEditor';
import {
  type ContentEditorData,
  type ContentMedia,
  type ContentPost,
  type ContentVersion,
  saveContentRequest,
  type UploadMediaRequest,
} from '@/services/contentService';
import { contentTypeSchema } from '@/services/creatorCalendarService';
import { creatorPlatformSchema } from '@/services/creatorsService';
import { type ContentForm, draftKey, useContentDraftStore } from '@/store/contentDraftStore';
import { newIdempotencyKey } from '@/utils/api';
import { fromDateKey } from '@/utils/dates';
import { showToast } from '@/utils/notifications';

// The web's content editor (/app/content/[id]) on the phone: schedule, script with Write and
// Analyze, the AI assistant, insights and versions, media, segment and topics, brand collab and
// shifting the calendar. "Save draft" keeps it a draft; the dark button puts it on the calendar.
// Unsaved changes are kept on the phone per creator and day (contentDraftStore), so leaving
// doesn't lose them.

const ASSIST_MS = 650;
const ANALYZE_MS = 900;
const KEEP_DRAFT_MS = 400;

function formFrom(post: ContentPost | null, date: string): ContentForm {
  const platform = creatorPlatformSchema.safeParse(post?.platform);
  const contentType = contentTypeSchema.safeParse(post?.contentType);
  return {
    title: post?.title ?? '',
    body: post?.body ?? '',
    date: post?.date ?? date,
    // A new piece has no time yet: 09:00 is a saner first guess than midnight.
    time: post?.time ?? '09:00',
    platform: platform.success ? platform.data : null,
    contentType: contentType.success ? contentType.data : null,
    segment: post?.segment ?? null,
    topics: post?.topics ?? [],
    brandCollab: post?.brandCollab ?? false,
    brandName: post?.brand?.name ?? '',
    brandAmount: post?.brand?.amount ?? null,
    brandDeal: post?.brand?.deal ?? 'paid',
    disclosure: post?.brand?.disclosure ?? DISCLOSURES[0],
    autopost: post?.autopost ?? false,
    versionNote: 'Edited',
  };
}

// "Wed, 22 Oct".
const dayText = (date: string) =>
  date
    ? fromDateKey(date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : 'Unscheduled';

interface ContentEditorProps {
  creatorId: string;
  creatorName: string;
  // The calendar day it was opened from.
  date: string;
  data: ContentEditorData;
}

export function ContentEditor({ creatorId, creatorName, date, data }: ContentEditorProps) {
  const insets = useSafeAreaInsets();
  const editable = data.canEdit;
  const save = useSaveContent(creatorId);
  const upload = useUploadContentMedia(creatorId);
  const reorder = useReorderContentMedia(creatorId);
  const removeMedia = useDeleteContentMedia(creatorId);
  const keepDraft = useContentDraftStore((s) => s.keep);
  const dropDraft = useContentDraftStore((s) => s.drop);

  const [postId, setPostId] = useState(data.post?.id ?? null);
  const key = draftKey(creatorId, date, postId);
  // Unsaved changes from last time, picked up when the editor opens.
  const [restored] = useState(() =>
    editable ? (useContentDraftStore.getState().drafts[key] ?? null) : null,
  );
  const [showRestored, setShowRestored] = useState(restored !== null);
  const [restoredAgo] = useState(() =>
    restored ? ago(new Date(restored.savedAt).toISOString(), Date.now()) : '',
  );
  const [form, setForm] = useState<ContentForm>(() => restored?.form ?? formFrom(data.post, date));
  const [dirty, setDirty] = useState(restored !== null);
  const [savedOnce, setSavedOnce] = useState(data.post !== null);
  const [status, setStatus] = useState(data.post?.status ?? 'draft');
  const [shift, setShift] = useState(false);
  const [media, setMedia] = useState<ContentMedia[]>(data.post?.media ?? []);
  const [versions, setVersions] = useState<ContentVersion[]>(data.post?.versions ?? []);
  const [instagramNote, setInstagramNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ScriptMode>('write');
  const [marked, setMarked] = useState<Marked | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [refining, setRefining] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // Keeps the unsaved changes on the phone, a moment after the last edit.
  useEffect(() => {
    if (!dirty || !editable) return;
    const t = setTimeout(() => keepDraft(key, form), KEEP_DRAFT_MS);
    return () => clearTimeout(t);
  }, [dirty, editable, form, key, keepDraft]);

  const change = (patch: Partial<ContentForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const label = platformLabel(form.platform, form.contentType);
  const caption = marked
    ? [marked.hook, ...marked.highlights, marked.cta ?? marked.suggestedCta, form.topics.join(' ')]
        .filter(Boolean)
        .join('\n\n')
    : '';

  const busy = save.isPending ? (save.variables?.content.status ?? null) : null;
  const saveState: SaveState = busy ? 'saving' : !savedOnce ? 'new' : dirty ? 'dirty' : 'saved';
  const primaryLabel =
    status === 'scheduled' && !dirty
      ? 'On the calendar ✓'
      : status === 'scheduled'
        ? 'Update calendar'
        : 'Add to calendar';

  const persist = (next: 'draft' | 'scheduled', after?: (id: string) => void) => {
    if (next === 'scheduled' && !form.date) {
      setError('Pick a date in Schedule before adding this to the calendar.');
      return;
    }
    const autopostOn =
      data.autoPost?.allowed === true &&
      form.autopost &&
      form.platform === 'instagram' &&
      next === 'scheduled';
    const request = saveContentRequest.safeParse({
      ...(postId ? { id: postId } : {}),
      title: form.title,
      body: form.body,
      status: next,
      date: form.date,
      time: form.time,
      platform: form.platform,
      contentType: form.contentType,
      segment: form.segment,
      topics: form.topics,
      brandCollab: form.brandCollab,
      brand:
        form.brandCollab && form.brandName.trim()
          ? {
              name: form.brandName.trim(),
              amount: form.brandAmount,
              deal: form.brandDeal,
              disclosure: form.disclosure,
            }
          : null,
      shiftExisting: shift,
      versionNote: form.versionNote || 'Edited',
      ...(data.autoPost?.allowed
        ? { autopost: autopostOn, ...(autopostOn ? { caption } : {}) }
        : {}),
    });
    if (!request.success) {
      setError(request.error.issues[0]?.message ?? 'Check the details and try again.');
      return;
    }
    setError(null);
    save.mutate(
      { content: request.data, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: ({ post, instagram }) => {
          dropDraft(draftKey(creatorId, date, postId));
          dropDraft(draftKey(creatorId, date, post.id));
          setPostId(post.id);
          setVersions(post.versions);
          setStatus(post.status);
          setForm((f) => ({ ...f, versionNote: 'Edited' }));
          setDirty(false);
          setSavedOnce(true);
          setShift(false);
          setShowRestored(false);
          setInstagramNote(instagram);
          if (!after) showToast(next === 'scheduled' ? 'On the calendar' : 'Draft saved');
          after?.(post.id);
        },
        onError: () => setError('We couldn’t save this. Please try again.'),
      },
    );
  };

  const discardRestored = () => {
    dropDraft(key);
    setForm(formFrom(data.post, date));
    setDirty(false);
    setShowRestored(false);
  };

  const later = (ms: number, fn: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };

  const runAssist = (askLabel: string, intent: Intent, attempt = 0) => {
    if (!form.body.trim()) {
      setError('Write your idea first — then the assistant can work on it.');
      return;
    }
    setError(null);
    setRefining(true);
    later(ASSIST_MS, () => {
      const result = assist(intent, form.body, label === 'Not set' ? '' : label, attempt);
      setSuggestion({ ...result, intent, attempt, label: askLabel });
      setRefining(false);
    });
  };

  const ask = (prompt: string) =>
    runAssist(prompt, PROMPT_INTENT[prompt] ?? intentFor(prompt) ?? 'improve');

  const analyze = () => {
    if (!form.body.trim()) {
      setError('Write your idea first — then Analyze marks the hook, highlights and CTA.');
      return;
    }
    setError(null);
    setMode('analyzing');
    later(ANALYZE_MS, () => {
      setMarked(markScript(form.body, label));
      setMode('analyzed');
    });
  };

  const uploadFiles = (files: UploadMediaRequest['files']) => {
    const send = (id: string) =>
      upload.mutate(
        { postId: id, files },
        {
          onSuccess: (added) => setMedia((m) => [...m, ...added]),
          onError: () => setError('Upload failed — check your connection.'),
        },
      );
    // Media hangs off a saved piece: a new one is saved as a draft first.
    if (postId) send(postId);
    else persist('draft', send);
  };

  const moveMedia = (id: string, to: number) => {
    const from = media.findIndex((m) => m.id === id);
    if (from < 0 || from === to) return;
    const next = [...media];
    next.splice(to, 0, ...next.splice(from, 1));
    setMedia(next);
    if (postId) {
      reorder.mutate(
        { postId, ids: next.map((m) => m.id) },
        { onError: () => setError('Couldn’t save the new slide order — try again.') },
      );
    }
  };

  const dropMedia = (id: string) => {
    if (!postId) return;
    const before = media;
    setMedia((list) => list.filter((m) => m.id !== id));
    removeMedia.mutate(
      { postId, mediaId: id },
      {
        onError: () => {
          setMedia(before);
          setError('Couldn’t remove that media — try again.');
        },
      },
    );
  };

  const shiftHint =
    form.date === (data.post?.date ?? date)
      ? data.shiftCount === 0
        ? `Nothing from ${dayText(form.date)} onward — nothing to shift.`
        : `${data.shiftCount} ${data.shiftCount === 1 ? 'piece' : 'pieces'} from ${dayText(form.date)} onward move a day later.`
      : `Pieces from ${dayText(form.date)} onward move a day later.`;

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <EditorHeader
        creatorId={creatorId}
        eyebrow={`${!editable ? 'Content' : postId ? 'Edit content' : 'Create content'} · ${dayText(form.date)}`}
        subtitle={creatorName || ' '}
        save={
          editable
            ? {
                state: saveState,
                busy,
                primaryLabel,
                onDraft: () => persist('draft'),
                onSchedule: () => persist('scheduled'),
              }
            : undefined
        }
      />

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            gap: 14,
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              className="rounded-xl bg-[#FEF3F2] px-3 py-2 font-inter text-xs leading-4 text-[#B42318]"
            >
              {error}
            </Text>
          ) : null}

          {showRestored && restored ? (
            <View className="flex-row items-center gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5">
              <Text className="flex-1 font-inter text-xs leading-4 text-[#92400E]">
                Picked up your unsaved changes from {restoredAgo}.
              </Text>
              <Pressable
                onPress={discardRestored}
                accessibilityRole="button"
                accessibilityLabel="Discard unsaved changes"
                className="active:opacity-70"
              >
                <Text className="font-inter-semibold text-xs text-[#92400E]">Discard</Text>
              </Pressable>
            </View>
          ) : null}

          <ScheduleCard
            date={form.date}
            time={form.time}
            platform={form.platform}
            contentType={form.contentType}
            autopost={form.autopost}
            autoPost={data.autoPost}
            instagramNote={instagramNote}
            editable={editable}
            onChange={change}
          />

          <ScriptCard
            kind={scriptKind(form.contentType)}
            title={form.title}
            body={form.body}
            editable={editable}
            mode={mode}
            marked={marked}
            cutLabel={label === 'Not set' ? 'Post' : label}
            caption={caption}
            topics={form.topics}
            onChange={change}
            onAnalyze={analyze}
            onWrite={() => setMode('write')}
            onAddCta={() => {
              if (!marked?.suggestedCta) return;
              change({
                body: `${form.body.trimEnd()} ${marked.suggestedCta}`,
                versionNote: 'Added CTA',
              });
              setMarked({ ...marked, cta: marked.suggestedCta, suggestedCta: null });
            }}
          >
            {editable ? (
              <AiAssistBar
                suggestion={suggestion}
                refining={refining}
                onAsk={ask}
                onAccept={() => {
                  if (!suggestion) return;
                  change({ body: suggestion.text, versionNote: suggestion.note });
                  setSuggestion(null);
                  setMarked(null);
                  setMode('write');
                }}
                onAnother={() => {
                  if (suggestion?.intent) {
                    runAssist(suggestion.label, suggestion.intent, suggestion.attempt + 1);
                  }
                }}
                onReject={() => setSuggestion(null)}
              />
            ) : null}
          </ScriptCard>

          <AssistantTabs
            body={form.body}
            scriptType={scriptType(form.contentType)}
            versions={versions}
            editable={editable}
            refining={refining}
            onAsk={ask}
            onRestore={(v) => {
              change({ body: v.body, versionNote: `Restored v${v.n}` });
              setMarked(null);
              setMode('write');
            }}
          />

          <MediaCard
            media={media}
            uploading={upload.isPending || (busy === 'draft' && !postId)}
            editable={editable}
            onUpload={uploadFiles}
            onRemove={dropMedia}
            onMove={moveMedia}
          />

          <SegmentTopicsCard
            segments={data.segments}
            segment={form.segment}
            topics={form.topics}
            body={form.body}
            editable={editable}
            onSegment={(segment) => change({ segment })}
            onTopics={(topics) => change({ topics })}
          />

          <BrandCollabCard
            on={form.brandCollab}
            name={form.brandName}
            amount={form.brandAmount}
            deal={form.brandDeal}
            disclosure={form.disclosure}
            brandOptions={data.brandOptions}
            editable={editable}
            onChange={change}
          />

          {editable ? (
            <ShiftCard on={shift} hint={shiftHint} editable={editable} onChange={setShift} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
