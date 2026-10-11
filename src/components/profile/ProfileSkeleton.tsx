import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of the profile (summary card, then the activity rows) shown
// while it loads. `rowsOnly` is the profile details' two cards.

const ROWS = [0, 1, 2, 3];

export function ProfileSkeleton({ rowsOnly = false }: { rowsOnly?: boolean }) {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading profile"
      className="gap-3 px-5 pt-2.5"
    >
      {rowsOnly ? null : (
        <View className="mb-4 h-[347px] items-center gap-3 rounded-[32px] bg-white/60 p-6">
          <View className="mt-3 h-[90px] w-[90px] rounded-full bg-cocoa/10" />
          <View className="h-6 w-32 rounded-md bg-cocoa/10" />
          <View className="h-4 w-20 rounded-md bg-cocoa/10" />
          <View className="h-[38px] w-52 rounded-full bg-cocoa/10" />
          <View className="mt-auto h-11 self-stretch rounded-md bg-cocoa/10" />
        </View>
      )}
      {(rowsOnly ? ROWS.slice(0, 2) : ROWS).map((i) => (
        <View key={i} className="h-[74px] rounded-[28px] bg-white/60" />
      ))}
    </Animated.View>
  );
}
