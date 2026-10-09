import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of a lead (hero, tabs, lead-by, links, message, rows,
// deliverables) shown while it loads.

export function LeadDetailsSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading lead"
      className="gap-[15px] px-[15px] pt-[5px]"
    >
      <View className="h-[205px] gap-3 rounded-3xl bg-white/60 p-6">
        <View className="flex-row justify-between">
          <View className="gap-2">
            <View className="h-6 w-40 rounded-md bg-cocoa/10" />
            <View className="h-4 w-24 rounded-md bg-cocoa/10" />
          </View>
          <View className="h-5 w-12 rounded-md bg-cocoa/10" />
        </View>
        <View className="flex-row gap-2">
          <View className="h-[27px] w-12 rounded-3xl bg-cocoa/10" />
          <View className="h-[27px] w-20 rounded-3xl bg-cocoa/10" />
        </View>
        <View className="flex-row gap-3 pt-3">
          {[0, 1, 2].map((i) => (
            <View key={i} className="h-11 w-11 rounded-full bg-cocoa/10" />
          ))}
        </View>
      </View>

      <View className="h-[51px] rounded-full bg-white/60" />

      <View className="gap-3">
        <View className="h-[60px] flex-row items-center justify-between rounded-[20px] bg-white/60 px-5">
          <View className="h-4 w-16 rounded-md bg-cocoa/10" />
          <View className="h-6 w-36 rounded-full bg-cocoa/10" />
        </View>

        <View className="flex-row justify-between pt-1">
          <View className="h-8 w-[166px] rounded-2xl bg-white/60" />
          <View className="h-8 w-[140px] rounded-2xl bg-white/60" />
        </View>

        <View className="h-[168px] gap-3 rounded-[20px] bg-white/60 px-5 pb-5 pt-8">
          <View className="h-5 w-32 rounded-md bg-cocoa/10" />
          {[0, 1, 2].map((i) => (
            <View key={i} className="h-3.5 rounded-md bg-cocoa/10" />
          ))}
        </View>

        <View className="h-16 rounded-[20px] bg-white/60" />
        <View className="h-16 rounded-[20px] bg-white/60" />
      </View>
    </Animated.View>
  );
}
