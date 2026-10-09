import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Pulsing placeholder in the shape of a talent chat (brief card, a couple of messages) shown
// while it loads. Holds still under reduced motion.

const SECTIONS = [0, 1, 2];

export function ChatSkeleton() {
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
      accessibilityLabel="Loading chat"
      className="gap-4 px-5"
    >
      <View className="gap-6 rounded-3xl bg-white/60 p-6">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 rounded-full bg-espresso/10" />
          <View className="gap-1.5">
            <View className="h-4 w-20 rounded-md bg-espresso/10" />
            <View className="h-3 w-14 rounded-md bg-espresso/10" />
          </View>
        </View>
        {SECTIONS.map((i) => (
          <View key={i} className="gap-3">
            <View className="h-[30px] w-32 rounded-[14px] bg-espresso/10" />
            <View className="h-4 w-full rounded-md bg-espresso/10" />
            <View className="h-4 w-3/4 rounded-md bg-espresso/10" />
          </View>
        ))}
      </View>
      <View className="h-11 w-3/5 self-start rounded-[20px] bg-white/60" />
      <View className="h-11 w-1/2 self-end rounded-[20px] bg-espresso/10" />
    </Animated.View>
  );
}
