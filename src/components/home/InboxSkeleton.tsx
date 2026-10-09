import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Pulsing placeholder for the messages panel's sections and profile card while the inbox
// loads. Holds still under reduced motion.

const SECTIONS = [1, 2, 3];

export function InboxSkeleton({ bottomInset }: { bottomInset: number }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.4, { duration: 700 }), -1, true);
  }, [opacity, reduceMotion]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading your messages"
      className="flex-1"
    >
      <View className="flex-1 gap-7 px-3 py-6">
        {SECTIONS.map((rows) => (
          <View key={rows} className="gap-1">
            <View className="mx-1.5 mb-2 h-3 w-28 rounded bg-black/[0.06]" />
            {Array.from({ length: rows }, (_, i) => (
              <View key={i} className="h-[52px] flex-row items-center gap-3 px-3.5">
                <View className="h-7 w-7 rounded-full bg-black/[0.06]" />
                <View className="h-3.5 w-32 rounded-md bg-black/[0.06]" />
              </View>
            ))}
          </View>
        ))}
      </View>

      <View className="px-5 pt-4" style={{ paddingBottom: bottomInset + 24 }}>
        <View className="h-[74px] flex-row items-center gap-3.5 rounded-3xl bg-white/80 p-3.5">
          <View className="h-11 w-11 rounded-full bg-black/[0.06]" />
          <View className="flex-1 gap-2">
            <View className="h-3.5 w-24 rounded-md bg-black/[0.06]" />
            <View className="h-3 w-16 rounded-md bg-black/[0.06]" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
