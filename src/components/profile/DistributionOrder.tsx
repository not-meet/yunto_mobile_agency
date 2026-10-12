import { Equal } from 'lucide-react-native';
import { useLayoutEffect, useMemo } from 'react';
import { PanResponder, Text, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import type { LeadDistribution } from '@/services/leadDistributionService';

// The members leads go to, one per row. With `reorderable` (round by round), each row's handle
// drags it to a new place in line while the rows it passes make room; screen readers get Move up
// / Move down instead. The drag runs on shared values, so nothing re-renders until it's dropped.

type Member = LeadDistribution['members'][number];

const ROW = 42;
const GAP = 8;
const STEP = ROW + GAP;

interface DistributionOrderProps {
  members: Member[];
  reorderable: boolean;
  onChange: (next: Member[]) => void;
}

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

function moved<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

export function DistributionOrder({ members, reorderable, onChange }: DistributionOrderProps) {
  // The row being dragged (-1 for none) and how far it's been dragged.
  const dragIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);

  // Let go only once the list shows the new order, so the dropped row doesn't flash back.
  useLayoutEffect(() => {
    dragIndex.set(-1);
    dragY.set(0);
  }, [members, dragIndex, dragY]);

  const move = (from: number, to: number) => {
    const target = clamp(to, 0, members.length - 1);
    if (target !== from) {
      onChange(moved(members, from, target));
      return;
    }
    dragIndex.set(-1);
    dragY.set(0);
  };

  return (
    <View style={{ gap: GAP }}>
      {members.map((member, i) => (
        <OrderRow
          key={member.id}
          name={member.name}
          index={i}
          count={members.length}
          reorderable={reorderable}
          dragIndex={dragIndex}
          dragY={dragY}
          onDrop={(dy) => move(i, i + Math.round(dy / STEP))}
          onMoveBy={(step) => move(i, i + step)}
        />
      ))}
    </View>
  );
}

interface OrderRowProps {
  name: string;
  index: number;
  count: number;
  reorderable: boolean;
  dragIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  onDrop: (dy: number) => void;
  onMoveBy: (step: -1 | 1) => void;
}

function OrderRow({
  name,
  index,
  count,
  reorderable,
  dragIndex,
  dragY,
  onDrop,
  onMoveBy,
}: OrderRowProps) {
  // Nothing re-renders mid-drag, so this stays the same responder for the whole gesture.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          dragY.set(0);
          dragIndex.set(index);
        },
        onPanResponderMove: (_, g) => {
          dragY.set(g.dy);
        },
        onPanResponderRelease: (_, g) => onDrop(g.dy),
        onPanResponderTerminate: () => onDrop(0),
      }),
    [dragIndex, dragY, index, onDrop],
  );

  // Lifted while it's the one dragged; shifted a row while another is dragged past it.
  const style = useAnimatedStyle(() => {
    const from = dragIndex.value;
    if (from === index) {
      return { transform: [{ translateY: dragY.value }], zIndex: 1, borderColor: '#D6CFC4' };
    }
    let shift = 0;
    if (from >= 0) {
      const target = clamp(from + Math.round(dragY.value / STEP), 0, count - 1);
      if (from < index && index <= target) shift = -STEP;
      else if (target <= index && index < from) shift = STEP;
    }
    return { transform: [{ translateY: shift }], zIndex: 0, borderColor: '#E5E7EB' };
  });

  const position = index + 1;

  return (
    <Animated.View
      accessible
      accessibilityLabel={reorderable ? `${name}, ${position} of ${count}` : name}
      accessibilityActions={
        reorderable
          ? [
              ...(position > 1 ? [{ name: 'moveUp', label: 'Move up' }] : []),
              ...(position < count ? [{ name: 'moveDown', label: 'Move down' }] : []),
            ]
          : undefined
      }
      onAccessibilityAction={(event) =>
        onMoveBy(event.nativeEvent.actionName === 'moveUp' ? -1 : 1)
      }
      className="flex-row items-center justify-between rounded-lg border bg-white pl-2.5"
      style={[{ height: ROW }, style]}
    >
      <Text
        numberOfLines={1}
        className="flex-1 font-inter-medium text-[13px] leading-6 text-black/70"
      >
        {name}
      </Text>
      {reorderable ? (
        <View {...pan.panHandlers} className="h-full w-11 items-center justify-center">
          <Equal size={20} color="rgba(0, 0, 0, 0.7)" strokeWidth={1.5} />
        </View>
      ) : null}
    </Animated.View>
  );
}
