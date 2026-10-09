import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { FILTERS, type NotificationFilter } from '@/components/notifications/labels';

// Horizontally scrolling chips under the header. The selected chip's wash fades in.

interface NotificationFiltersProps {
  selected: NotificationFilter;
  onSelect: (filter: NotificationFilter) => void;
}

export function NotificationFilters({ selected, onSelect }: NotificationFiltersProps) {
  const reduceMotion = useReducedMotion();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerStyle={{ gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
    >
      {FILTERS.map(({ key, label }) => {
        const active = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className="h-[35px] justify-center overflow-hidden rounded-[20px] border border-white/80 bg-white/60 px-[18px] active:opacity-70"
            style={active ? { boxShadow: '0px 4px 12px rgba(156, 39, 176, 0.06)' } : undefined}
          >
            {active ? (
              <Animated.View
                entering={reduceMotion ? undefined : FadeIn.duration(180)}
                exiting={reduceMotion ? undefined : FadeOut.duration(140)}
                className="absolute inset-0 border border-white"
                style={{
                  borderRadius: 20,
                  experimental_backgroundImage:
                    'linear-gradient(121.66deg, #EBE4FF 0%, #FFEBF2 100%)',
                }}
              />
            ) : null}
            <View>
              <Text
                className={`font-inter-semibold text-sm leading-[17px] ${
                  active ? 'text-[#2B2240]' : 'text-[#666666]'
                }`}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
