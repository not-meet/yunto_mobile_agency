import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of Assign Creators (the numbers card, the tabs, a team and
// its first members) shown while it loads.

const ROWS = [0, 1, 2];

export function AssignCreatorsSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading creators"
      className="gap-4 px-5 pt-2.5"
    >
      <View className="h-[220px] gap-4 rounded-[28px] bg-white/60 p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 rounded-[20px] bg-cocoa/10" />
          <View className="h-5 w-36 rounded-md bg-cocoa/10" />
        </View>
        <View className="h-3 w-24 rounded-md bg-cocoa/10" />
        <View className="h-7 w-16 rounded-md bg-cocoa/10" />
        <View className="mt-auto flex-row gap-3">
          <View className="h-12 flex-1 rounded-xl bg-cocoa/10" />
          <View className="h-12 flex-1 rounded-xl bg-cocoa/10" />
          <View className="h-12 flex-1 rounded-xl bg-cocoa/10" />
        </View>
      </View>
      <View className="h-12 rounded-full bg-white/60" />
      <View className="h-20 flex-row items-center gap-3 rounded-[27px] bg-white/60 px-5">
        <View className="h-11 w-11 rounded-full bg-cocoa/10" />
        <View className="gap-2">
          <View className="h-4 w-32 rounded-md bg-cocoa/10" />
          <View className="h-3 w-48 rounded-md bg-cocoa/10" />
        </View>
      </View>
      {ROWS.map((i) => (
        <View key={i} className="h-[62px] flex-row items-center gap-3 rounded-2xl bg-white/60 px-3">
          <View className="h-9 w-9 rounded-full bg-cocoa/10" />
          <View className="gap-1.5">
            <View className="h-3.5 w-20 rounded-md bg-cocoa/10" />
            <View className="h-3 w-14 rounded-md bg-cocoa/10" />
          </View>
          <View className="ml-auto h-5 w-12 rounded-full bg-cocoa/10" />
        </View>
      ))}
    </Animated.View>
  );
}
