import { Pressable, ScrollView, Text } from 'react-native';

import type { AssignableCreator } from '@/services/teamService';

// How a member's creators are ordered on their page. "newest" is most recently assigned first,
// the order they arrive in.

export type CreatorOrder = 'followers' | 'engagement' | 'newest';

const OPTIONS: { key: CreatorOrder; label: string }[] = [
  { key: 'followers', label: 'Followers' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'newest', label: 'Newest' },
];

export function sortCreators(creators: AssignableCreator[], order: CreatorOrder) {
  switch (order) {
    case 'followers':
      return [...creators].sort((a, b) => b.followers - a.followers);
    case 'engagement':
      return [...creators].sort((a, b) => b.engagementRate - a.engagementRate);
    case 'newest':
      return creators;
  }
}

interface CreatorSortPillsProps {
  value: CreatorOrder;
  onChange: (next: CreatorOrder) => void;
}

export function CreatorSortPills({ value, onChange }: CreatorSortPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel="Sort"
      contentContainerStyle={{ alignItems: 'center', gap: 8 }}
    >
      <Text className="pr-0.5 font-inter text-[13px] leading-5 text-[#78716C]">Sort</Text>
      {OPTIONS.map(({ key, label }) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            className={`h-[34px] items-center justify-center rounded-full px-4 active:opacity-80 ${
              selected ? 'bg-[#181818]' : 'border border-[rgba(231,229,228,0.8)] bg-white'
            }`}
          >
            <Text
              className={`text-[13px] leading-5 ${
                selected ? 'font-inter-medium text-white' : 'font-inter text-[#44403C]'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
