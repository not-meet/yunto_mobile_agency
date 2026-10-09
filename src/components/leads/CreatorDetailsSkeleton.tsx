import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of a creator on a lead (hero, analytics, deliverables,
// timeline) shown while they load.

export function CreatorDetailsSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading creator"
      className="gap-6 px-4 pt-1"
    >
      <View className="h-[185px] gap-4 rounded-[28px] bg-white/60 p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3.5">
            <View className="h-14 w-14 rounded-full bg-cocoa/10" />
            <View className="gap-2">
              <View className="h-5 w-32 rounded-md bg-cocoa/10" />
              <View className="h-3 w-20 rounded-md bg-cocoa/10" />
              <View className="h-4 w-28 rounded-full bg-cocoa/10" />
            </View>
          </View>
          <View className="h-[31px] w-[74px] rounded-full bg-cocoa/10" />
        </View>
        <View className="h-[54px] rounded-[18px] bg-cocoa/10" />
      </View>

      <View className="gap-3">
        <View className="h-4 w-32 rounded-md bg-cocoa/10" />
        {[0, 1].map((row) => (
          <View key={row} className="flex-row gap-3">
            <View className="h-[102px] flex-1 rounded-[20px] bg-white/60" />
            <View className="h-[102px] flex-1 rounded-[20px] bg-white/60" />
          </View>
        ))}
      </View>

      <View className="gap-3">
        <View className="h-4 w-24 rounded-md bg-cocoa/10" />
        <View className="h-1.5 rounded-full bg-white/60" />
        <View className="h-[163px] rounded-[22px] bg-white/60" />
      </View>
    </Animated.View>
  );
}
