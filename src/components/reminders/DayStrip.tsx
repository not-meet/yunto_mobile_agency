import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { GREEN_GRADIENT, GREEN_SHADOW, weekdayCaps } from '@/components/reminders/labels';
import { addDays, daysFromToday, fromDateKey, longDate, todayDate, toDateKey } from '@/utils/dates';

// A scrolling row of days from today. Keeps the selected day in view, including when it's set
// from the quick picks above.

const DAYS_AHEAD = 60;
const CELL = 68;
const GAP = 10;

interface DayStripProps {
  // "YYYY-MM-DD", today or later.
  selected: string;
  onSelect: (date: string) => void;
}

export function DayStrip({ selected, onSelect }: DayStripProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, daysFromToday(fromDateKey(selected)));
  const today = todayDate();
  const days = Array.from({ length: Math.max(DAYS_AHEAD, selectedIndex + 7) }, (_, i) =>
    addDays(today, i),
  );

  // Leaves one day showing before the selected one.
  useEffect(() => {
    const x = Math.max(0, (selectedIndex - 1) * (CELL + GAP));
    const frame = requestAnimationFrame(() => scrollRef.current?.scrollTo({ x, animated: true }));
    return () => cancelAnimationFrame(frame);
  }, [selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerStyle={{ gap: GAP, paddingBottom: 8 }}
    >
      {days.map((date) => {
        const key = toDateKey(date);
        const active = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={longDate(date)}
            accessibilityState={{ selected: active }}
            className={`h-[73px] items-center justify-center gap-1.5 rounded-[20px] border active:opacity-70 ${
              active ? 'border-white' : 'border-white/80 bg-white/60'
            }`}
            style={{
              width: CELL,
              ...(active
                ? { experimental_backgroundImage: GREEN_GRADIENT, boxShadow: GREEN_SHADOW }
                : undefined),
            }}
          >
            <Text
              className={`font-inter-semibold text-[13px] leading-4 tracking-[0.5px] ${
                active ? 'text-[#1F4D33]' : 'text-[#6B627A]'
              }`}
            >
              {weekdayCaps(date)}
            </Text>
            <Text
              className={`font-inter-extrabold text-lg leading-[22px] ${
                active ? 'text-[#1F4D33]' : 'text-[#2B2240]'
              }`}
            >
              {date.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
