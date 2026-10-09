import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, PanResponder, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { StackedCard, TalentCard } from '@/components/talent/TalentCard';
import type { TalentListItem } from '@/services/talentService';

// The browse deck: one profile up front with the next two tilted behind it. Swipe left for the
// next profile, right for the previous one; it loops, so nobody is ever removed.

const CARD_MAX_WIDTH = 310;
const CARD_MAX_HEIGHT = 460;
// The tilted cards hang below the front one, so the deck is this much taller than a card.
const DECK_OVERHANG = 1.13;
const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 0.6;
const EASE = Easing.out(Easing.cubic);

// Where the new front card starts: roughly where it sat in the stack behind.
function enterFromStack() {
  'worklet';
  const config = { duration: 320, easing: EASE };
  return {
    initialValues: {
      opacity: 0.5,
      transform: [{ translateY: 48 }, { scale: 0.95 }, { rotate: '-3deg' }],
    },
    animations: {
      opacity: withTiming(1, config),
      transform: [
        { translateY: withTiming(0, config) },
        { scale: withTiming(1, config) },
        { rotate: withTiming('0deg', config) },
      ],
    },
  };
}

type Direction = 1 | -1;

interface FrontCardProps {
  talent: TalentListItem;
  height: number;
  // False when it's the only profile: a swipe just springs it back.
  canSwipe: boolean;
  onSwiped: (direction: Direction) => void;
  onOpen: () => void;
}

// Keyed by talent, so every profile gets a fresh, centred card.
function FrontCard({ talent, height, canSwipe, onSwiped, onOpen }: FrontCardProps) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const translateX = useSharedValue(0);

  const pan = useMemo(() => {
    const fling = (direction: Direction) => {
      if (!canSwipe) {
        translateX.set(withSpring(0, { damping: 18 }));
        return;
      }
      if (reduceMotion) {
        onSwiped(direction);
        return;
      }
      translateX.set(
        withTiming(direction * width * 1.2, { duration: 220, easing: EASE }, (finished) => {
          if (finished) scheduleOnRN(onSwiped, direction);
        }),
      );
    };
    return PanResponder.create({
      // Captured only for a clearly sideways drag, so taps still reach the card.
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        translateX.set(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_DISTANCE || g.vx > SWIPE_VELOCITY) fling(1);
        else if (g.dx < -SWIPE_DISTANCE || g.vx < -SWIPE_VELOCITY) fling(-1);
        else translateX.set(withSpring(0, { damping: 18 }));
      },
      onPanResponderTerminate: () => {
        translateX.set(withSpring(0, { damping: 18 }));
      },
    });
  }, [translateX, width, reduceMotion, canSwipe, onSwiped]);

  // A slight tilt that follows the drag.
  const dragStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${interpolate(translateX.value, [-width, width], [-8, 8])}deg` },
    ],
  }));

  return (
    <Animated.View entering={reduceMotion ? undefined : enterFromStack}>
      <Animated.View
        style={dragStyle}
        accessibilityActions={[
          { name: 'next', label: 'Next profile' },
          { name: 'previous', label: 'Previous profile' },
        ]}
        onAccessibilityAction={(e) => {
          if (canSwipe) onSwiped(e.nativeEvent.actionName === 'next' ? -1 : 1);
        }}
        {...pan.panHandlers}
      >
        <TalentCard talent={talent} height={height} onOpen={onOpen} />
      </Animated.View>
    </Animated.View>
  );
}

interface TalentDeckProps {
  talents: TalentListItem[];
  onOpen: (talent: TalentListItem) => void;
}

export function TalentDeck({ talents, onOpen }: TalentDeckProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [space, setSpace] = useState(0);
  const count = talents.length;
  const at = (offset: number) => talents[(((index + offset) % count) + count) % count];

  const width = Math.min(CARD_MAX_WIDTH, screenWidth - 65);
  const height = Math.min(CARD_MAX_HEIGHT, Math.floor(space / DECK_OVERHANG));

  // A swipe left brings the next profile, a swipe right the previous one.
  const onSwiped = useMemo(
    () => (direction: Direction) => setIndex((i) => (i - direction + count) % count),
    [count],
  );

  // Only the cards on screen load their photos; warm up the ones a swipe away.
  const ahead = at(3)?.photoUrl;
  const behind = at(-1)?.photoUrl;
  useEffect(() => {
    const urls = [ahead, behind].filter((url): url is string => Boolean(url));
    if (urls.length > 0) void Image.prefetch(urls);
  }, [ahead, behind]);

  const front = at(0);
  const second = count > 1 ? at(1) : undefined;
  const third = count > 2 ? at(2) : undefined;

  return (
    <View
      className="flex-1 items-center justify-center"
      onLayout={(e: LayoutChangeEvent) => setSpace(e.nativeEvent.layout.height)}
    >
      {front && height > 0 ? (
        <View style={{ width, height: height * DECK_OVERHANG }}>
          {third ? (
            <View
              className="absolute"
              style={{
                width: width * 0.9,
                left: width * 0.05 - 23,
                top: height * 0.22,
                transform: [{ rotate: '5deg' }],
              }}
            >
              <StackedCard talent={third} height={height * 0.9} fade={0.3} />
            </View>
          ) : null}
          {second ? (
            <View
              className="absolute"
              style={{
                width: width * 0.95,
                left: width * 0.025 - 17,
                top: height * 0.18,
                transform: [{ rotate: '-3deg' }],
              }}
            >
              <StackedCard talent={second} height={height * 0.95} fade={0.5} />
            </View>
          ) : null}
          <FrontCard
            key={front.id}
            talent={front}
            height={height}
            canSwipe={count > 1}
            onSwiped={onSwiped}
            onOpen={() => onOpen(front)}
          />
        </View>
      ) : null}
    </View>
  );
}
