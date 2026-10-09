import type { ReactNode } from 'react';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

// Rises and fades a section in when the screen opens, a beat after the one above it
// (`order` 0, 1, 2…). Appears at once under reduced motion.

const STAGGER_MS = 70;

export function Reveal({ order, children }: { order: number; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(order * STAGGER_MS).duration(320)}
    >
      {children}
    </Animated.View>
  );
}
