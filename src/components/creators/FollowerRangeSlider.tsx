import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { followersRangeLabel } from '@/components/creators/labels';
import { FOLLOWERS_MAX } from '@/services/creatorsService';

// Fewest followers a creator can have, from 0 up to 1M in steps of 10K. Drag the thumb or tap the
// track.

const THUMB = 25;
const STEP = 10_000;
const STEPS = FOLLOWERS_MAX / STEP;

interface FollowerRangeSliderProps {
  value: number;
  onChange: (next: number) => void;
}

export function FollowerRangeSlider({ value, onChange }: FollowerRangeSliderProps) {
  const [width, setWidth] = useState(0);
  const index = Math.round(value / STEP);
  // Where the drag started: on the track, and on screen.
  const start = useRef({ x: 0, pageX: 0 });

  const moveTo = (at: number) => {
    const next = Math.min(STEPS, Math.max(0, at)) * STEP;
    if (next !== value) onChange(next);
  };
  const pick = (x: number) => {
    if (width > 0) moveTo(Math.round((x / width) * STEPS));
  };
  // A tenth of the range per swipe, for screen readers.
  const step = (by: number) => moveTo(index + by * (STEPS / 10));
  const fill = width * (index / STEPS);

  return (
    <View className="gap-1">
      <Text className="text-right font-inter-medium text-[10px] leading-4 text-black/70">
        {followersRangeLabel(value)}
      </Text>
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        // Keeps the sheet's scroll from taking over mid-drag.
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => {
          start.current = { x: e.nativeEvent.locationX, pageX: e.nativeEvent.pageX };
          pick(start.current.x);
        }}
        onResponderMove={(e) => pick(start.current.x + e.nativeEvent.pageX - start.current.pageX)}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Follower range"
        accessibilityValue={{ text: followersRangeLabel(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        className="h-[25px] justify-center"
      >
        <View pointerEvents="none" className="h-[9px] rounded-full bg-[#D2D0D0]">
          <View
            className="h-[9px] rounded-full bg-[#2E2E2E]"
            style={{ width: Math.max(fill, 9) }}
          />
        </View>
        <View
          pointerEvents="none"
          className="absolute items-center justify-center rounded-full border-[2.5px] border-black bg-white"
          style={{
            width: THUMB,
            height: THUMB,
            left: Math.min(Math.max(fill - THUMB / 2, 0), Math.max(width - THUMB, 0)),
            boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.2)',
          }}
        >
          <View className="h-[11px] w-[11px] rounded-full bg-black" />
        </View>
      </View>
    </View>
  );
}
