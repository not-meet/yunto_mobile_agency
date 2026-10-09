import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of the leads screen (banner, status chips, lead cards) shown
// while leads load.

const CHIPS = [88, 134, 97, 130];
const CARDS = [0, 1, 2, 3];

export function LeadsSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading your leads"
      className="gap-[18px] px-4"
    >
      <View className="h-16 flex-row items-center justify-between rounded-2xl bg-white/60 px-5">
        <View className="h-4 w-40 rounded-md bg-cocoa/10" />
        <View className="h-8 w-24 rounded-full bg-cocoa/10" />
      </View>

      <View className="-mx-4 flex-row gap-2.5 overflow-hidden px-4 py-[5px]">
        {CHIPS.map((width, i) => (
          <View key={i} className="h-[39px] rounded-[20px] bg-white/60" style={{ width }} />
        ))}
      </View>

      <View className="gap-3.5">
        {CARDS.map((i) => (
          <View key={i} className="h-[138px] justify-between rounded-3xl bg-white/60 p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 rounded-full bg-cocoa/10" />
                <View className="gap-2">
                  <View className="h-4 w-28 rounded-md bg-cocoa/10" />
                  <View className="h-3 w-12 rounded-md bg-cocoa/10" />
                </View>
              </View>
              <View className="h-6 w-20 rounded-full bg-cocoa/10" />
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row gap-3">
                <View className="h-5 w-12 rounded-full bg-cocoa/10" />
                <View className="h-5 w-20 rounded-full bg-cocoa/10" />
                <View className="h-5 w-16 rounded-full bg-cocoa/10" />
              </View>
              <View className="flex-row gap-[7px]">
                <View className="h-[30px] w-[30px] rounded-full bg-cocoa/10" />
                <View className="h-[30px] w-[30px] rounded-full bg-cocoa/10" />
              </View>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
