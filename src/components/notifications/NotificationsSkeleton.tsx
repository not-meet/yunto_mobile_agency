import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Pulsing placeholder for the attention cards and the first day of notifications while the
// feed loads. Holds still under reduced motion.

const ATTENTION = [0, 1, 2];
const NOTIFICATIONS = [0, 1, 2];

export function NotificationsSkeleton() {
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
      accessibilityLabel="Loading your notifications"
      className="gap-3 px-5"
    >
      <View className="mb-1 h-5 w-44 rounded-lg bg-espresso/10" />
      {ATTENTION.map((i) => (
        <View
          key={i}
          className="h-[78px] flex-row items-center gap-3.5 rounded-[20px] bg-white/60 p-4"
        >
          <View className="h-11 w-11 rounded-[14px] bg-espresso/10" />
          <View className="flex-1 gap-2">
            <View className="h-4 w-44 rounded-md bg-espresso/10" />
            <View className="h-3 w-24 rounded-md bg-espresso/10" />
          </View>
        </View>
      ))}

      <View className="mb-1 mt-5 h-5 w-20 rounded-lg bg-espresso/10" />
      {NOTIFICATIONS.map((i) => (
        <View
          key={i}
          className="h-[76px] flex-row items-start gap-3.5 rounded-[20px] bg-white/60 p-4"
        >
          <View className="h-10 w-10 rounded-xl bg-espresso/10" />
          <View className="flex-1 gap-2 pt-0.5">
            <View className="h-4 w-40 rounded-md bg-espresso/10" />
            <View className="h-3.5 w-28 rounded-md bg-espresso/10" />
          </View>
          <View className="h-3 w-10 rounded-md bg-espresso/10" />
        </View>
      ))}
    </Animated.View>
  );
}
