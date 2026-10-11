import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of the Creators list's cards, shown while they first load.

const CARDS = [0, 1, 2];

export function CreatorListSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading creators"
      className="gap-3"
    >
      <View className="h-4 w-28 rounded-md bg-cocoa/10" />
      {CARDS.map((i) => (
        <View key={i} className="h-[211px] gap-3.5 rounded-[26px] bg-white/60 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 rounded-full bg-cocoa/10" />
            <View className="flex-1 gap-2">
              <View className="h-4 w-28 rounded-md bg-cocoa/10" />
              <View className="h-3 w-20 rounded-md bg-cocoa/10" />
              <View className="h-4 w-44 rounded-full bg-cocoa/10" />
            </View>
            <View className="h-6 w-6 rounded-full bg-cocoa/10" />
          </View>
          <View className="h-[53px] rounded-2xl bg-cocoa/10" />
          <View className="flex-row gap-2">
            <View className="h-[31px] flex-1 rounded-xl bg-cocoa/10" />
            <View className="h-[31px] flex-1 rounded-xl bg-cocoa/10" />
            <View className="h-[31px] flex-1 rounded-xl bg-cocoa/10" />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}
