import { Trash2 } from 'lucide-react-native';
import { type ReactNode, useMemo } from 'react';
import { PanResponder, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Lets its card be swiped right to dismiss it. A "Dismiss" hint in the card's hue shows through
// behind it as it moves. Screen reader users get the same action from the card itself.

const SWIPE_DISTANCE = 96;
const SWIPE_VELOCITY = 0.8;

interface SwipeToDismissProps {
  // The card's hue, for the hint behind it.
  color: string;
  onDismiss: () => void;
  children: ReactNode;
}

export function SwipeToDismiss({ color, onDismiss, children }: SwipeToDismissProps) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const translateX = useSharedValue(0);

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Captured only for a clearly rightward drag, so taps and vertical scrolls go through.
        onMoveShouldSetPanResponderCapture: (_, g) =>
          g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          translateX.set(Math.max(0, g.dx));
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx < SWIPE_DISTANCE && g.vx < SWIPE_VELOCITY) {
            translateX.set(withSpring(0, { damping: 18, stiffness: 220 }));
          } else if (reduceMotion) {
            onDismiss();
          } else {
            translateX.set(
              withTiming(width, { duration: 200 }, (finished) => {
                if (finished) scheduleOnRN(onDismiss);
              }),
            );
          }
        },
        onPanResponderTerminate: () => {
          translateX.set(withSpring(0, { damping: 18, stiffness: 220 }));
        },
      }),
    [translateX, width, reduceMotion, onDismiss],
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(translateX.value, [0, width], [1, 0.6], Extrapolation.CLAMP),
  }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_DISTANCE], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(translateX.value, [0, SWIPE_DISTANCE], [0.9, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <View>
      {/* Hidden at rest, so it can't tint the translucent card. */}
      <Animated.View
        className="absolute inset-0 flex-row items-center gap-2 rounded-[20px] px-5"
        style={[hintStyle, { backgroundColor: `${color}14` }]}
      >
        <Trash2 size={16} color={color} strokeWidth={2} />
        <Text className="font-inter-bold text-sm leading-[17px]" style={{ color }}>
          Dismiss
        </Text>
      </Animated.View>
      <Animated.View style={cardStyle} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}
