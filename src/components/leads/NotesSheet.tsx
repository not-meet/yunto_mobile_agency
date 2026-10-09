import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { BottomSheet } from '@/components/common/BottomSheet';
import type { Note } from '@/services/leadActivityService';
import { dayLabel, timeLabel } from '@/utils/dates';

// Every note on the lead, newest first, opened from "See all notes". Each card shows two lines
// until it's tapped open.

const COLLAPSED_LINES = 2;

function NoteCard({ note }: { note: Note }) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const created = new Date(note.createdAt);

  return (
    <Animated.View
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      className="overflow-hidden rounded-2xl border border-[#EFEFEF] bg-[#FAFAFA]"
    >
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityHint={expanded ? 'Collapses the note' : 'Shows the full note'}
        className="gap-2 px-4 py-3 active:opacity-80"
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-inter-medium text-xs leading-[15px] text-[#6C6C70]">
            {dayLabel(created)} • {timeLabel(created)}
          </Text>
          <Animated.View
            style={{
              transform: [{ rotate: expanded ? '180deg' : '0deg' }],
              ...(reduceMotion
                ? null
                : { transitionProperty: 'transform', transitionDuration: 250 }),
            }}
          >
            <ChevronDown size={16} color="#8A8A8E" strokeWidth={1.67} />
          </Animated.View>
        </View>
        <Text
          numberOfLines={expanded ? undefined : COLLAPSED_LINES}
          className="font-inter text-sm leading-[21px] text-[#1C1C1E]"
        >
          {note.text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface NotesSheetProps {
  visible: boolean;
  onClose: () => void;
  notes: Note[];
}

export function NotesSheet({ visible, onClose, notes }: NotesSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="All Notes">
      {notes.length > 0 ? (
        <ScrollView
          className="mt-6 shrink"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </ScrollView>
      ) : (
        <Text className="py-10 text-center font-inter-medium text-[15px] leading-5 text-muted">
          No notes yet. Add one to keep track of the deal.
        </Text>
      )}
    </BottomSheet>
  );
}
