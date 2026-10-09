import { Pressable, ScrollView } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { CREATOR_FILTER_CHIPS, type CreatorFilter } from '@/components/leads/labels';

// Row of status chips above a lead's creators. The selected one turns dark with a short colour
// ease.

interface CreatorFiltersProps {
  selected: CreatorFilter;
  counts: Record<CreatorFilter, number>;
  onSelect: (filter: CreatorFilter) => void;
}

export function CreatorFilters({ selected, counts, onSelect }: CreatorFiltersProps) {
  const reduceMotion = useReducedMotion();
  const ease = (...properties: ('backgroundColor' | 'color')[]) =>
    reduceMotion ? null : { transitionProperty: properties, transitionDuration: 200 };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Lets the chips' shadows show past the row's edges.
      className="grow-0"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}
    >
      {CREATOR_FILTER_CHIPS.map(({ key, label, icon: Icon, background }) => {
        const active = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${label}, ${counts[key]} creators`}
            className="active:opacity-80"
          >
            <Animated.View
              className="h-[34px] flex-row items-center gap-1.5 rounded-full border px-3.5"
              style={{
                backgroundColor: active ? '#141311' : background,
                borderColor: active ? '#141311' : 'rgba(232, 229, 223, 0.3)',
                boxShadow: active
                  ? '0px 4px 12px rgba(0, 0, 0, 0.1)'
                  : '0px 2px 8px rgba(0, 0, 0, 0.02)',
                ...ease('backgroundColor'),
              }}
            >
              <Icon size={12} color={active ? '#FAF7F2' : '#141311'} strokeWidth={2} />
              <Animated.Text
                className={`text-xs leading-4 ${active ? 'font-inter-bold' : 'font-inter-semibold'}`}
                style={{ color: active ? '#FAF7F2' : '#141311', ...ease('color') }}
              >
                {label}
              </Animated.Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
