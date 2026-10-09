import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Pulsing placeholder for a filter bar over a list of cards (`withFilters` false drops the bar,
// for screens that show their real filters while loading). Holds still under reduced motion.

const CARDS = [0, 1, 2];

interface ListSkeletonProps {
  label: string;
  cardHeight: number;
  withFilters?: boolean;
}

export function ListSkeleton({ label, cardHeight, withFilters = true }: ListSkeletonProps) {
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
      accessibilityLabel={label}
      className="gap-4 px-[15px]"
    >
      {withFilters ? (
        <View className="h-[50px] flex-row items-center gap-1 rounded-[30px] bg-white/60 px-1.5">
          <View className="h-9 w-24 rounded-3xl bg-espresso/10" />
          <View className="h-9 w-32 rounded-3xl bg-espresso/5" />
          <View className="h-9 w-24 rounded-3xl bg-espresso/5" />
        </View>
      ) : null}
      {CARDS.map((i) => (
        <View key={i} className="gap-4 rounded-3xl bg-white/60 p-5" style={{ height: cardHeight }}>
          <View className="h-5 w-40 rounded-md bg-espresso/10" />
          <View className="flex-row gap-1.5">
            <View className="h-6 w-24 rounded-3xl bg-espresso/10" />
            <View className="h-6 w-20 rounded-3xl bg-espresso/10" />
          </View>
          <View className="h-4 w-48 rounded-md bg-espresso/10" />
          <View className="mt-auto h-9 w-24 self-end rounded-[20px] bg-espresso/10" />
        </View>
      ))}
    </Animated.View>
  );
}
