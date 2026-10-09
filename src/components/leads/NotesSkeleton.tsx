import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulse } from '@/hooks/usePulse';

// Pulsing placeholder in the shape of the notes tab (follow-up block, note field, timeline)
// shown while notes and activity load.

export function NotesSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading notes and activity"
      className="gap-3"
    >
      <View className="h-[58px] flex-row items-center gap-3 rounded-xl bg-white/60 p-3">
        <View className="h-8 w-[60px] rounded-md bg-cocoa/10" />
        <View className="h-4 flex-1 rounded-md bg-cocoa/10" />
        <View className="h-8 w-[60px] rounded-full bg-cocoa/10" />
      </View>

      <View className="h-[50px] flex-row items-center rounded-xl bg-white/60 py-1.5 pl-4 pr-1.5">
        <View className="h-4 w-40 flex-1 rounded-md bg-cocoa/10" />
        <View className="ml-3 h-9 w-9 rounded-full bg-cocoa/10" />
      </View>

      <View className="h-6 w-28 self-center rounded-full bg-white/60" />

      <View className="gap-6 pt-6">
        {[0, 1].map((group) => (
          <View key={group} className="gap-3">
            <View className="ml-10 h-3.5 w-20 rounded-md bg-cocoa/10" />
            {[0, 1].map((i) => (
              <View key={i} className="flex-row items-start gap-4">
                <View className="mt-2.5 h-6 w-6 rounded-full bg-cocoa/10" />
                <View className="h-[62px] flex-1 gap-2 rounded-xl bg-white/60 px-4 py-3">
                  <View className="h-4 w-40 rounded-md bg-cocoa/10" />
                  <View className="h-3 w-24 rounded-md bg-cocoa/10" />
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
