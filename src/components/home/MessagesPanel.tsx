import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { InboxContent } from '@/components/home/InboxContent';

// Side panel that slides in from the right when the messages button on home is tapped. Closes
// from the backdrop, the close button, the back button, or by dragging it back to the right.
// Stays mounted until its slide-out finishes, so closing is as smooth as opening.

const PANEL_MAX_WIDTH = 340;
// The panel leaves this share of the screen uncovered on the left.
const PANEL_SCREEN_SHARE = 0.8267;
const OPEN = { duration: 300, easing: Easing.out(Easing.cubic) };
const CLOSE = { duration: 220, easing: Easing.in(Easing.cubic) };
const DRAG_DISTANCE = 80;
const DRAG_VELOCITY = 0.6;

const PANEL_BACKGROUND =
  'linear-gradient(172.68deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 253, 246, 0.98) 100%)';

interface MessagesPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function MessagesPanel({ visible, onClose }: MessagesPanelProps) {
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * PANEL_SCREEN_SHARE, PANEL_MAX_WIDTH);
  const reduceMotion = useReducedMotion();
  // 0 closed, 1 open.
  const progress = useSharedValue(0);
  // How far the panel is being dragged towards closed.
  const dragX = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);
  // Run once the slide-out ends, e.g. navigating to the profile.
  const afterClose = useRef<(() => void) | null>(null);

  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      dragX.set(0);
      progress.set(withTiming(1, reduceMotion ? { duration: 0 } : OPEN));
      return;
    }
    const finish = () => {
      setMounted(false);
      afterClose.current?.();
      afterClose.current = null;
    };
    progress.set(
      withTiming(0, reduceMotion ? { duration: 0 } : CLOSE, (finished) => {
        if (finished) scheduleOnRN(finish);
      }),
    );
  }, [visible, reduceMotion, progress, dragX]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Only a clearly rightward drag, so taps and the list's vertical scroll still go through.
        onMoveShouldSetPanResponderCapture: (_, g) =>
          g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          dragX.set(Math.max(0, g.dx));
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > DRAG_DISTANCE || g.vx > DRAG_VELOCITY) onClose();
          else dragX.set(withSpring(0, { damping: 20, stiffness: 220 }));
        },
        onPanResponderTerminate: () => {
          dragX.set(withSpring(0, { damping: 20, stiffness: 220 }));
        },
      }),
    [dragX, onClose],
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity:
      progress.value * interpolate(dragX.value, [0, panelWidth], [1, 0.2], Extrapolation.CLAMP),
  }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * panelWidth + dragX.value }],
  }));

  const closeThen = (action: () => void) => {
    afterClose.current = action;
    onClose();
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={backdropStyle} className="absolute inset-0 bg-black/25">
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close messages"
          className="flex-1"
        />
      </Animated.View>

      <Animated.View
        {...pan.panHandlers}
        accessibilityViewIsModal
        className="absolute bottom-0 right-0 top-0 overflow-hidden rounded-l-[32px] border-l border-white/70"
        style={[
          panelStyle,
          {
            width: panelWidth,
            experimental_backgroundImage: PANEL_BACKGROUND,
            boxShadow: '-12px 0px 40px rgba(0, 0, 0, 0.06)',
          },
        ]}
      >
        <InboxContent open={visible} onClose={onClose} closeThen={closeThen} />
      </Animated.View>
    </Modal>
  );
}
