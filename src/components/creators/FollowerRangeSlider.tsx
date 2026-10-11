import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { FOLLOWER_STOPS } from '@/components/creators/labels';
import { formatCount } from '@/utils/format';

// Most followers a creator can have, as a slider that snaps to FOLLOWER_STOPS. The last stop
// is "any". Drag the thumb or tap the track.

const THUMB = 25;
const LAST = FOLLOWER_STOPS.length - 1;

export const followerRangeLabel = (max: number | null) =>
  max === null ? 'Any' : `0 - ${formatCount(max)}`;

interface FollowerRangeSliderProps {
  value: number | null;
  onChange: (next: number | null) => void;
}

export function FollowerRangeSlider({ value, onChange }: FollowerRangeSliderProps) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, FOLLOWER_STOPS.indexOf(value));
  // Where the drag started: on the track, and on screen.
  const start = useRef({ x: 0, pageX: 0 });

  const pick = (x: number) => {
    if (width <= 0) return;
    const at = Math.min(LAST, Math.max(0, Math.round((x / width) * LAST)));
    onChange(FOLLOWER_STOPS[at] ?? null);
  };

  const step = (by: number) => {
    const next = Math.min(LAST, Math.max(0, index + by));
    onChange(FOLLOWER_STOPS[next] ?? null);
  };
  const fill = width * (index / LAST);

  return (
    <View className="gap-1">
      <Text className="text-right font-inter-medium text-[10px] leading-4 text-black/70">
        {followerRangeLabel(value)}
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
        accessibilityValue={{ text: followerRangeLabel(value) }}
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
