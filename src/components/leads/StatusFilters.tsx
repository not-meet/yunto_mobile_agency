import { Pressable, ScrollView } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { FILTER_CHIPS, type LeadFilter } from '@/components/leads/labels';

// Scrolling row of status chips above the leads list, each with its count. The selected chip
// darkens with a short colour ease. None is selected while the banner's "Review now" is on.

const ACTIVE_SHADOW = '0px 4px 12px rgba(90, 62, 117, 0.08)';
const IDLE_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.02)';

interface StatusFiltersProps {
  selected: LeadFilter;
  counts: Record<(typeof FILTER_CHIPS)[number]['key'], number>;
  onSelect: (filter: LeadFilter) => void;
}

export function StatusFilters({ selected, counts, onSelect }: StatusFiltersProps) {
  const reduceMotion = useReducedMotion();
  const ease = (...properties: ('backgroundColor' | 'borderColor' | 'color')[]) =>
    reduceMotion ? null : { transitionProperty: properties, transitionDuration: 200 };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Lets the chips' shadows show past the row's edges.
      className="-mx-4 grow-0"
      contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingVertical: 5 }}
    >
      {FILTER_CHIPS.map(({ key, label }) => {
        const active = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${label}, ${counts[key]} leads`}
            className="active:opacity-80"
          >
            <Animated.View
              className="h-[39px] justify-center rounded-[20px] border px-[18px]"
              style={{
                backgroundColor: active ? '#312B28' : 'rgba(255, 255, 255, 0.4)',
                borderColor: active ? '#312B28' : 'rgba(255, 255, 255, 0.56)',
                boxShadow: active ? ACTIVE_SHADOW : IDLE_SHADOW,
                ...ease('backgroundColor', 'borderColor'),
              }}
            >
              <Animated.Text
                className="font-inter-semibold text-sm leading-[17px]"
                style={{ color: active ? '#F9F2EF' : '#666666', ...ease('color') }}
              >
                {label} ({counts[key]})
              </Animated.Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
