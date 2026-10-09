import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  FILTERS,
  GREEN_GRADIENT,
  GREEN_SHADOW,
  type ReminderFilter,
} from '@/components/reminders/labels';

// Today / Upcoming / All under the header, each with its count. The selected one is green.

interface ReminderFiltersProps {
  selected: ReminderFilter;
  onSelect: (filter: ReminderFilter) => void;
  // Left out while the list loads.
  counts?: Record<ReminderFilter, number>;
}

export function ReminderFilters({ selected, onSelect, counts }: ReminderFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
    >
      {FILTERS.map(({ key, label }) => {
        const active = key === selected;
        const count = counts?.[key];
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
            accessibilityState={{ selected: active }}
            className={`h-[45px] flex-row items-center gap-2 rounded-[28px] border px-5 active:opacity-70 ${
              active ? 'border-white/90' : 'border-white/70 bg-white/45'
            }`}
            style={
              active
                ? { experimental_backgroundImage: GREEN_GRADIENT, boxShadow: GREEN_SHADOW }
                : {
                    boxShadow:
                      '0px 4px 12px rgba(0, 0, 0, 0.02), inset 0px 1px 1px 1px rgba(255, 255, 255, 0.5)',
                  }
            }
          >
            <Text
              className={`font-inter-semibold text-[15px] leading-[18px] ${
                active ? 'text-[#1F4D33]' : 'text-[#6B627A]'
              }`}
            >
              {label}
            </Text>
            {count !== undefined ? (
              <View
                className={`rounded-xl px-2 py-0.5 ${active ? 'bg-white/90' : 'bg-white/70'}`}
                style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.03)' }}
              >
                <Text
                  className={`font-inter-bold text-xs leading-[15px] ${
                    active ? 'text-[#1F4D33]' : 'text-[#6B627A]'
                  }`}
                >
                  {count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
