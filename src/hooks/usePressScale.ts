import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// A slight press-in: spread `handlers` on a Pressable and put `style` on an Animated.View
// around it. Stays still under reduced motion.
export function usePressScale(pressedScale = 0.97) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return {
    style,
    handlers: {
      onPressIn: () => {
        if (!reduceMotion) scale.set(withTiming(pressedScale, { duration: 90 }));
      },
      onPressOut: () => {
        scale.set(withSpring(1, { damping: 16, stiffness: 260 }));
      },
    },
  };
}
