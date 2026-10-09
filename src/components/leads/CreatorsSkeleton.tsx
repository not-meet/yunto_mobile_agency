import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of a lead's creators (chips, search, selection bar, creator
// cards) shown while they load.

const CHIPS = [117, 109, 80];
const CARDS = [0, 1, 2];

export function CreatorsSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading creators"
      className="gap-5"
    >
      <View className="flex-row gap-2 px-4 py-1">
        {CHIPS.map((width, i) => (
          <View key={i} className="h-[34px] rounded-full bg-white/60" style={{ width }} />
        ))}
      </View>
      <View className="gap-5 px-4">
        <View className="h-[50px] rounded-[20px] bg-white/60" />
        <View className="h-[42px] rounded-2xl bg-white/60" />
        <View className="gap-3">
          <View className="flex-row justify-between">
            <View className="h-4 w-32 rounded-md bg-cocoa/10" />
            <View className="h-4 w-14 rounded-md bg-cocoa/10" />
          </View>
          {CARDS.map((i) => (
            <View key={i} className="h-[182px] gap-3 rounded-3xl bg-white/60 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 rounded-full bg-cocoa/10" />
                  <View className="gap-2">
                    <View className="h-4 w-28 rounded-md bg-cocoa/10" />
                    <View className="h-3 w-20 rounded-md bg-cocoa/10" />
                  </View>
                </View>
                <View className="h-7 w-7 rounded-full bg-cocoa/10" />
              </View>
              <View className="h-[46px] rounded-[14px] bg-cocoa/10" />
              <View className="flex-row gap-2 pt-1">
                <View className="h-[31px] flex-1 rounded-xl bg-cocoa/10" />
                <View className="h-[31px] flex-1 rounded-xl bg-cocoa/10" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
