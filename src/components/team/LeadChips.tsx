import { Pressable, ScrollView, Text, View } from 'react-native';

import { CARD_SHADOW } from '@/components/home/shared';
import type { LeadChip } from '@/components/team/labels';

// Filters over a member's leads, each with its count. The selected one is dark; the others keep
// their own tint, in turn (amber, then green).

const IDLE_TONES = [
  { background: 'rgba(255, 251, 235, 0.6)', border: '#FFD230', dot: '#FFB900', text: '#BB4D00' },
  { background: 'rgba(240, 253, 244, 0.6)', border: '#7BF1A8', dot: '#05DF72', text: '#008236' },
];

interface LeadChipsProps {
  chips: LeadChip[];
  counts: number[];
  selected: number;
  onSelect: (index: number) => void;
}

export function LeadChips({ chips, counts, selected, onSelect }: LeadChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingVertical: 4 }}
    >
      {chips.map((chip, i) => {
        const active = i === selected;
        const tone = IDLE_TONES[(i - 1 + IDLE_TONES.length) % IDLE_TONES.length] ?? IDLE_TONES[0]!;
        const count = counts[i] ?? 0;
        return (
          <Pressable
            key={chip.label}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${chip.label}, ${count}`}
            className="h-8 flex-row items-center gap-1.5 rounded-full border px-3 active:opacity-80"
            style={
              active
                ? { backgroundColor: '#111111', borderColor: '#111111', boxShadow: CARD_SHADOW }
                : { backgroundColor: tone.background, borderColor: tone.border }
            }
          >
            {active ? null : (
              <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
            )}
            <Text
              className="font-inter-medium text-xs leading-4"
              style={{ color: active ? '#F4F6F8' : tone.text }}
            >
              {chip.label}
            </Text>
            {active ? (
              <View className="h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5">
                <Text className="font-inter-medium text-xs leading-4 text-[#F4F6F8]">{count}</Text>
              </View>
            ) : (
              <Text
                className="pl-1 font-inter-medium text-xs leading-4"
                style={{ color: tone.text }}
              >
                {count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
