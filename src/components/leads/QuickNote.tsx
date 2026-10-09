import { ChevronUp, Send } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { useAddLeadNote } from '@/hooks/useLeadActivity';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { showToast } from '@/utils/notifications';
import { sanitizeNote } from '@/utils/sanitize';

// "Add a quick note" field, with a badge under it that opens every note on the lead.

interface QuickNoteProps {
  leadId: string;
  noteCount: number;
  onSeeAll: () => void;
}

export function QuickNote({ leadId, noteCount, onSeeAll }: QuickNoteProps) {
  const addNote = useAddLeadNote(leadId);
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const submit = () => {
    if (!trimmed || addNote.isPending) return;
    addNote.mutate(trimmed, {
      onSuccess: () => {
        setText('');
        showToast('Note saved');
      },
    });
  };

  return (
    <View className="gap-3">
      <View className="h-[50px] flex-row items-center rounded-xl border border-white/70 bg-white/40 py-1.5 pl-4 pr-1.5">
        <TextInput
          value={text}
          onChangeText={(next) => {
            setText(sanitizeNote(next));
            if (addNote.isError) addNote.reset();
          }}
          onSubmitEditing={submit}
          placeholder="Add a quick note..."
          placeholderTextColor={PLACEHOLDER_COLOR}
          returnKeyType="send"
          submitBehavior="blurAndSubmit"
          accessibilityLabel="Quick note"
          className="flex-1 px-0.5 py-0 font-inter text-[15px] leading-[18px] text-[#1C1C1E]"
        />
        <Pressable
          onPress={submit}
          disabled={!trimmed || addNote.isPending}
          accessibilityRole="button"
          accessibilityLabel="Save note"
          accessibilityState={{ disabled: !trimmed, busy: addNote.isPending }}
          className={`h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-70 ${
            trimmed ? '' : 'opacity-60'
          }`}
          style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}
        >
          {addNote.isPending ? (
            <ActivityIndicator size="small" color="#1C1C1E" />
          ) : (
            <Send size={16} color="#1C1C1E" strokeWidth={1.33} />
          )}
        </Pressable>
      </View>

      {addNote.isError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          We couldn’t save your note. Please try again.
        </Text>
      ) : null}

      <Pressable
        onPress={onSeeAll}
        accessibilityRole="button"
        accessibilityLabel={`See all notes, ${noteCount}`}
        className="flex-row items-center gap-1 self-center rounded-full border border-white/70 bg-white/60 px-3 py-1.5 active:opacity-70"
      >
        <Text className="font-inter-semibold text-xs leading-[15px] text-[#6C6C70]">
          See all notes{noteCount > 0 ? ` (${noteCount})` : ''}
        </Text>
        <ChevronUp size={14} color="#6C6C70" strokeWidth={1.67} />
      </Pressable>
    </View>
  );
}
