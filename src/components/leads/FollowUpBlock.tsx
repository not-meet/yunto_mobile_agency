import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import type { ScheduledFollowUpDay } from '@/services/leadActivityService';
import { dayLabel, fromDateKey } from '@/utils/dates';

// Top of the notes tab: when the next follow-up is (if any), and "Add" to schedule one. The day
// fades over when a new follow-up moves it.

interface FollowUpBlockProps {
  followUp: ScheduledFollowUpDay | null;
  onAdd: () => void;
}

export function FollowUpBlock({ followUp, onAdd }: FollowUpBlockProps) {
  const reduceMotion = useReducedMotion();
  const when = followUp ? dayLabel(fromDateKey(followUp.date)) : 'None';

  return (
    <View className="flex-row items-center justify-between rounded-xl border border-[rgba(255,218,196,0.8)] bg-[rgba(255,235,222,0.7)] p-3">
      <View
        accessibilityLabel={`Next follow-up, ${when}`}
        className="rounded-md bg-white px-3 py-2"
        style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.02)' }}
      >
        <Animated.Text
          key={when}
          entering={reduceMotion ? undefined : FadeIn.duration(250)}
          numberOfLines={1}
          className="font-inter-bold text-[13px] leading-4 text-[#C05E23]"
        >
          {when}
        </Animated.Text>
      </View>
      <Text
        numberOfLines={1}
        className="flex-1 pl-3 font-inter-semibold text-[15px] leading-[18px] text-[#1C1C1E]"
      >
        Add Follow-Up
      </Text>
      <Pressable
        onPress={onAdd}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Add follow-up"
        className="rounded-full bg-white px-4 py-2 active:opacity-70"
        style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}
      >
        <Text className="font-inter-bold text-[13px] leading-4 text-[#1C1C1E]">Add</Text>
      </Pressable>
    </View>
  );
}
