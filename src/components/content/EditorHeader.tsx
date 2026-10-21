import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BackButton } from '@/components/common/BackButton';

// The editor's top: back, "Create content · WED, 22 OCT", the save state, and the two saves:
// "Save draft" keeps it a draft, the dark one puts it on the calendar. Read only, just the title.

export type SaveState = 'new' | 'saving' | 'dirty' | 'saved';

const CHIPS: Record<SaveState, { text: string; color: string; background: string }> = {
  new: { text: 'Not saved yet', color: '#B45309', background: '#FFF7E6' },
  saving: { text: 'Saving…', color: '#475569', background: '#F1F5F9' },
  dirty: { text: 'Unsaved changes', color: '#B45309', background: '#FFF7E6' },
  saved: { text: 'Saved just now', color: '#15803D', background: '#EFFAF3' },
};

interface EditorHeaderProps {
  creatorId: string;
  eyebrow: string;
  subtitle: string;
  // Omitted when read only.
  save?: {
    state: SaveState;
    // Which save is running, to spin its button.
    busy: 'draft' | 'scheduled' | null;
    primaryLabel: string;
    onDraft: () => void;
    onSchedule: () => void;
  };
}

export function EditorHeader({ creatorId, eyebrow, subtitle, save }: EditorHeaderProps) {
  const chip = save ? CHIPS[save.state] : null;
  const busy = save?.busy !== null && save?.busy !== undefined;

  return (
    <View className="gap-3 px-4 pb-3 pt-5">
      <View className="flex-row items-center gap-4">
        <BackButton
          tone="dark"
          fallbackHref={{ pathname: '/creators/calendar', params: { id: creatorId } }}
        />
        <View className="flex-1 gap-1">
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="font-inter-bold text-[11px] uppercase leading-4 tracking-[0.55px] text-[#94A3B8]"
          >
            {eyebrow}
          </Text>
          <Text numberOfLines={1} className="font-inter-medium text-xs leading-4 text-black/70">
            {subtitle}
          </Text>
        </View>
        {chip ? (
          <View
            accessibilityLiveRegion="polite"
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: chip.background }}
          >
            <Text className="font-inter-medium text-xs leading-4" style={{ color: chip.color }}>
              {chip.text}
            </Text>
          </View>
        ) : null}
      </View>

      {save ? (
        <View className="flex-row gap-2">
          <Pressable
            onPress={save.onDraft}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Save draft"
            accessibilityState={{ disabled: busy, busy: save.busy === 'draft' }}
            className={`h-10 flex-1 items-center justify-center rounded-full border border-[#E2E8F0] bg-white active:opacity-70 ${
              busy && save.busy !== 'draft' ? 'opacity-50' : ''
            }`}
          >
            {save.busy === 'draft' ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <Text className="font-inter-semibold text-[13px] leading-4 text-[#0F172A]">
                Save draft
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={save.onSchedule}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={save.primaryLabel}
            accessibilityState={{ disabled: busy, busy: save.busy === 'scheduled' }}
            className={`h-10 flex-1 items-center justify-center rounded-full bg-black active:opacity-80 ${
              busy && save.busy !== 'scheduled' ? 'opacity-50' : ''
            }`}
          >
            {save.busy === 'scheduled' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="font-inter-semibold text-[13px] leading-4 text-white">
                {save.primaryLabel}
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
