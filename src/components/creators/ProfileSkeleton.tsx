import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of a creator's profile (profile card, platforms,
// commercials) shown while it loads.

export function ProfileSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading creator"
      className="gap-4 px-5 pt-1"
    >
      <View className="h-[415px] gap-3 rounded-[28px] bg-white/60 p-5">
        <View className="flex-row gap-4">
          <View className="h-[72px] w-[72px] rounded-[20px] bg-cocoa/10" />
          <View className="flex-1 gap-2">
            <View className="h-5 w-36 rounded-md bg-cocoa/10" />
            <View className="h-3 w-24 rounded-md bg-cocoa/10" />
            <View className="mt-2 h-8 w-44 rounded-full bg-cocoa/10" />
          </View>
        </View>
        <View className="h-[31px] w-40 rounded-full bg-cocoa/10" />
        <View className="h-[31px] w-44 rounded-full bg-cocoa/10" />
        <View className="h-[57px] rounded-[18px] bg-cocoa/10" />
        <View className="mt-auto h-[74px] rounded-[18px] bg-cocoa/10" />
      </View>
      <View className="h-[142px] rounded-[28px] bg-white/60" />
      <View className="h-[142px] rounded-[28px] bg-white/60" />
    </Animated.View>
  );
}
