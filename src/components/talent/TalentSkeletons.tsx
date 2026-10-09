import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Pulsing placeholders for the talent screens. Hold still under reduced motion.

function usePulse() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.4, { duration: 700 }), -1, true);
  }, [opacity, reduceMotion]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

// The deck: a front card with two tilted ones behind it.
export function TalentDeckSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading profiles"
      className="flex-1 items-center justify-center"
    >
      <View className="h-[440px] w-[290px]">
        <View
          className="absolute left-[-10px] top-[90px] h-[380px] w-[270px] rounded-[32px] bg-white/50"
          style={{ transform: [{ rotate: '5deg' }] }}
        />
        <View
          className="absolute left-[-8px] top-[70px] h-[400px] w-[280px] rounded-[32px] bg-white/60"
          style={{ transform: [{ rotate: '-3deg' }] }}
        />
        <View className="h-[420px] gap-4 rounded-[32px] bg-white/85 p-4">
          <View className="h-[180px] rounded-[20px] bg-espresso/10" />
          <View className="flex-row justify-between">
            <View className="h-7 w-28 rounded-md bg-espresso/10" />
            <View className="h-7 w-16 rounded-xl bg-espresso/10" />
          </View>
          <View className="h-4 w-full rounded-md bg-espresso/10" />
          <View className="h-4 w-3/4 rounded-md bg-espresso/10" />
          <View className="mt-auto h-[52px] rounded-3xl bg-espresso/10" />
        </View>
      </View>
    </Animated.View>
  );
}

// A profile: hero photo, price card, summary, expertise, stats and the first past work.
export function TalentProfileSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading profile"
      className="gap-4 px-5"
    >
      <View className="h-[460px] rounded-[28px] bg-espresso/10" />
      <View className="-mt-14 h-[68px] w-[303px] self-center rounded-3xl bg-white/80" />
      <View className="h-[132px] rounded-3xl bg-white/60" />
      <View className="gap-3 pt-2">
        <View className="h-[19px] w-24 rounded-md bg-espresso/10" />
        <View className="flex-row flex-wrap gap-2.5">
          {[72, 104, 128, 92].map((width) => (
            <View key={width} className="h-[34px] rounded-[20px] bg-white/70" style={{ width }} />
          ))}
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="h-[85px] flex-1 rounded-[20px] bg-white/70" />
        <View className="h-[85px] flex-1 rounded-[20px] bg-white/70" />
      </View>
      <View className="h-[87px] rounded-[20px] bg-white/70" />
      <View className="gap-3">
        <View className="h-[19px] w-24 rounded-md bg-espresso/10" />
        <View className="flex-row gap-3">
          <View
            className="flex-1 rounded-2xl bg-espresso/10"
            style={{ aspectRatio: 161 / 207.5 }}
          />
          <View
            className="flex-1 rounded-2xl bg-espresso/10"
            style={{ aspectRatio: 161 / 207.5 }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// The booking screen: summary card and the first section under it.
export function BookingSkeleton() {
  const pulse = usePulse();

  return (
    <Animated.View
      style={pulse}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading booking"
      className="gap-6 px-5"
    >
      <View className="h-[106px] rounded-3xl bg-white/70" />
      <View className="h-[240px] rounded-3xl bg-white/60" />
    </Animated.View>
  );
}
