import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { FormatToolbar } from '@/components/content/FormatToolbar';
import {
  continueList,
  type Edit,
  type InlineStyle,
  lineList,
  type ListStyle,
  normalize,
  selectionHas,
  type Selection,
  styleTyped,
  toggleInline,
  toggleList,
  typedSpan,
} from '@/components/content/richText';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { sanitizeContentBody, sanitizeContentTitle } from '@/utils/sanitize';

// The writing surface from yunto_mobile_app's editor: a bold title over the caption or script,
// both edited in place, under a row of formatting buttons for the caption (see richText.ts: it
// stays plain text). Read only, without the buttons, for a piece that can't be changed.

const CARET = '#C9A7FF';
const CARD_SHADOW =
  '0px 12px 32px rgba(0, 0, 0, 0.03), inset 0px 2px 8px 1px rgba(255, 255, 255, 0.6)';
// Selection events this soon after the text is changed here still describe the old text, so
// they don't override the cursor being put back.
const STALE_SELECTION_MS = 150;
const INLINE: readonly InlineStyle[] = ['bold', 'italic', 'underline', 'strike'];

interface ContentCanvasProps {
  title: string;
  body: string;
  onChange: (patch: { title?: string; body?: string }) => void;
  minHeight: number;
  editable: boolean;
}

export function ContentCanvas({ title, body, onChange, minHeight, editable }: ContentCanvasProps) {
  const selection = useRef<Selection>({ start: body.length, end: body.length });
  // Set right after the text is changed here, to put the cursor back; dropped on the next move.
  const [forced, setForced] = useState<Selection | undefined>(undefined);
  const forcedAt = useRef(0);
  // Styles switched on with nothing selected, for what's typed next.
  const [typing, setTyping] = useState<ReadonlySet<InlineStyle>>(new Set());
  const [cursor, setCursor] = useState<Selection>(() => ({ start: body.length, end: body.length }));

  const apply = (edit: Edit) => {
    const text = sanitizeContentBody(edit.text);
    const clamp = (n: number) => Math.min(n, text.length);
    const next = { start: clamp(edit.selection.start), end: clamp(edit.selection.end) };
    selection.current = next;
    setCursor(next);
    setForced(next);
    forcedAt.current = Date.now();
    onChange({ body: text });
  };

  const changeBody = (raw: string) => {
    const added = typedSpan(body, raw);
    if (!added) {
      onChange({ body: sanitizeContentBody(raw) });
      return;
    }
    const styled = typing.size > 0 ? normalize(styleTyped(added.text, typing)) : added.text;
    let edit: Edit = {
      text: raw.slice(0, added.at) + styled + raw.slice(added.at + added.text.length),
      selection: { start: added.at + styled.length, end: added.at + styled.length },
    };
    if (added.text === '\n') edit = continueList(edit.text, added.at) ?? edit;
    if (edit.text === raw) onChange({ body: sanitizeContentBody(raw) });
    else apply(edit);
  };

  const collapsed = cursor.start === cursor.end;
  const active = new Set<InlineStyle | ListStyle>(
    collapsed ? typing : INLINE.filter((style) => selectionHas(body, cursor, style)),
  );
  const list = lineList(body, cursor);
  if (list) active.add(list);

  const format = (f: InlineStyle | ListStyle) => {
    if (f === 'bullet' || f === 'numbered') {
      apply(toggleList(body, selection.current, f));
      return;
    }
    if (selection.current.start === selection.current.end) {
      setTyping((on) => {
        const next = new Set(on);
        if (next.has(f)) next.delete(f);
        else next.add(f);
        return next;
      });
      return;
    }
    apply(toggleInline(body, selection.current, f));
  };

  return (
    <View className="gap-3">
      {editable ? <FormatToolbar active={active} onPress={format} /> : null}
      <View
        className="gap-3 rounded-3xl border border-white/90 bg-white/65 p-6"
        style={{ minHeight, boxShadow: CARD_SHADOW }}
      >
        <TextInput
          value={title}
          onChangeText={(text) => onChange({ title: sanitizeContentTitle(text) })}
          editable={editable}
          placeholder="Give this piece a title"
          placeholderTextColor={PLACEHOLDER_COLOR}
          multiline
          submitBehavior="blurAndSubmit"
          cursorColor={CARET}
          selectionColor={CARET}
          accessibilityLabel="Title"
          className="p-0 font-inter-bold text-[22px] leading-[31px] tracking-[-0.4px] text-[#1A1A1C]"
        />
        <TextInput
          value={body}
          onChangeText={changeBody}
          editable={editable}
          selection={forced}
          onSelectionChange={(e) => {
            const next = e.nativeEvent.selection;
            if (forced) {
              const same = next.start === forced.start && next.end === forced.end;
              if (!same && Date.now() - forcedAt.current < STALE_SELECTION_MS) return;
              setForced(undefined);
            }
            selection.current = next;
            setCursor(next);
          }}
          // While a style is on for what's typed next, the keyboard commits each letter as it's
          // typed instead of holding a word it would rewrite over the styled letters.
          autoCorrect={typing.size === 0}
          placeholder={editable ? 'Write the caption or script here.' : 'No caption yet.'}
          placeholderTextColor={PLACEHOLDER_COLOR}
          multiline
          textAlignVertical="top"
          cursorColor={CARET}
          selectionColor={CARET}
          accessibilityLabel="Caption"
          className="flex-1 p-0 font-inter-medium text-base leading-6 text-[#1A1A1C]"
        />
      </View>
    </View>
  );
}
