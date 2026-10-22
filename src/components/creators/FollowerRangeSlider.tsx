import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { followersRangeLabel } from '@/components/creators/labels';
import { FOLLOWERS_MAX } from '@/services/creatorsService';

// Fewest followers a creator can have, from 0 up to 1M in steps of 10K. Drag the thumb or tap the
// track. The drag moves only the slider; the value is handed up once it's let go, so the sheet
// around it doesn't re-render on every step.

const THUMB = 25;
const STEP = 10_000;
const STEPS = FOLLOWERS_MAX / STEP;

interface FollowerRangeSliderProps {
  value: number;
  onChange: (next: number) => void;
}

export function FollowerRangeSlider({ value, onChange }: FollowerRangeSliderProps) {
  const [width, setWidth] = useState(0);
  // Where the thumb is mid-drag; null when not dragging.
  const [dragging, setDragging] = useState<number | null>(null);
  const shown = dragging ?? value;
  const index = Math.round(shown / STEP);
  // Where the drag started: on the track, and on screen.
  const start = useRef({ x: 0, pageX: 0 });

  const clamp = (at: number) => Math.min(STEPS, Math.max(0, at)) * STEP;
  const moveTo = (at: number) => {
    const next = clamp(at);
    if (next !== value) onChange(next);
  };
  const dragTo = (x: number) => {
    if (width > 0) setDragging(clamp(Math.round((x / width) * STEPS)));
  };
  const release = () => {
    if (dragging !== null && dragging !== value) onChange(dragging);
    setDragging(null);
  };
  // A tenth of the range per swipe, for screen readers.
  const step = (by: number) => moveTo(index + by * (STEPS / 10));
  const fill = width * (index / STEPS);

  return (
    <View className="gap-1">
      <Text className="text-right font-inter-medium text-[10px] leading-4 text-black/70">
        {followersRangeLabel(shown)}
      </Text>
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => {
          start.current = { x: e.nativeEvent.locationX, pageX: e.nativeEvent.pageX };
          dragTo(start.current.x);
          // Returning true keeps the sheet's native scroll from taking over mid-drag.
          return true;
        }}
        onResponderMove={(e) => dragTo(start.current.x + e.nativeEvent.pageX - start.current.pageX)}
        onResponderRelease={release}
        onResponderTerminate={release}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Follower range"
        accessibilityValue={{ text: followersRangeLabel(shown) }}
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
