import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// The skeletons' slow breathe: put the style on an Animated.View around the placeholder shapes.
// Holds still under reduced motion.
export function usePulse() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.set(withRepeat(withTiming(0.4, { duration: 700 }), -1, true));
  }, [opacity, reduceMotion]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}
