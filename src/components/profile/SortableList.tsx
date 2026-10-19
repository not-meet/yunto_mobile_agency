import { type ReactNode, useEffect, useMemo } from 'react';
import { type GestureResponderHandlers, PanResponder, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

// A list of fixed-height rows that can be dragged into a new order by a handle (the lead
// distribution sequence and priority recipients). Rows are placed from an order kept on the UI
// thread, not from where React renders them: while one is dragged the others glide out of its
// way, and once it has settled into its slot the new order is handed to `onReorder`. That
// re-render then moves nothing, so the drop is seamless. Rows added or removed from outside fade
// in and out while the rest glide to their new places. With `numbered`, each slot is numbered
// on the left; the numbers stay put while the rows move past them.

const SETTLE = { duration: 180 };

interface SortableListProps<T extends { id: string }> {
  items: T[];
  rowHeight: number;
  gap: number;
  reorderable: boolean;
  numbered: boolean;
  onReorder: (ids: string[]) => void;
  // `handle` goes on the drag handle; `slot` is the row's place in line right now (0 first),
  // following the drag, for anything that should change as rows move.
  renderItem: (
    item: T,
    row: { index: number; handle: GestureResponderHandlers; slot: SharedValue<number> },
  ) => ReactNode;
}

function moved(list: string[], from: number, to: number): string[] {
  'worklet';
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

export function SortableList<T extends { id: string }>({
  items,
  rowHeight,
  gap,
  reorderable,
  numbered,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const step = rowHeight + gap;
  const count = items.length;
  const ids = items.map((item) => item.id);
  const idsKey = ids.join(',');

  // Where each row sits, by id. Follows the props, except mid-drag, when it runs ahead of them.
  const order = useSharedValue(ids);
  const activeId = useSharedValue<string | null>(null);
  const startTop = useSharedValue(0);
  const dragY = useSharedValue(0);
  const maxTop = (count - 1) * step;
  const activeTop = useDerivedValue(() =>
    Math.min(Math.max(startTop.value + dragY.value, 0), maxTop),
  );

  // Rows added, removed or moved from outside (the sheets, Move up / Move down).
  useEffect(() => {
    const next = idsKey ? idsKey.split(',') : [];
    if (order.get().join(',') !== idsKey) order.set(next);
  }, [idsKey, order]);

  // While dragging, make room wherever the dragged row is over.
  useAnimatedReaction(
    () => (activeId.value === null ? -1 : Math.round(activeTop.value / step)),
    (target) => {
      const id = activeId.value;
      if (target < 0 || id === null) return;
      const from = order.value.indexOf(id);
      if (from >= 0 && from !== target) order.set(moved(order.value, from, target));
    },
  );

  const height = Math.max(count * step - gap, 0);
  const animatedHeight = useSharedValue(height);
  useEffect(() => {
    animatedHeight.set(withTiming(height, SETTLE));
  }, [height, animatedHeight]);
  const containerStyle = useAnimatedStyle(() => ({ height: animatedHeight.value }));

  const settled = (next: string[]) => {
    if (next.join(',') !== idsKey) onReorder(next);
  };

  const grab = (id: string) =>
    scheduleOnUI(() => {
      'worklet';
      startTop.set(Math.max(order.value.indexOf(id), 0) * step);
      dragY.set(0);
      activeId.set(id);
    });

  const offset = numbered ? 30 : 0;

  return (
    <Animated.View style={containerStyle}>
      {numbered
        ? items.map((item, i) => (
            <View
              key={`n-${i}`}
              className="absolute left-0 h-5 w-5 items-center justify-center rounded-full bg-[#1E1B18]"
              style={{ top: i * step + (rowHeight - 20) / 2 }}
            >
              <Text className="font-inter-bold text-[10px] leading-[15px] text-white">{i + 1}</Text>
            </View>
          ))
        : null}
      {items.map((item, i) => (
        <SortableRow
          key={item.id}
          id={item.id}
          index={i}
          step={step}
          left={offset}
          height={rowHeight}
          reorderable={reorderable && count > 1}
          order={order}
          activeId={activeId}
          activeTop={activeTop}
          dragY={dragY}
          onGrab={() => grab(item.id)}
          onSettled={settled}
        >
          {(handle, slot) => renderItem(item, { index: i, handle, slot })}
        </SortableRow>
      ))}
    </Animated.View>
  );
}

interface SortableRowProps {
  id: string;
  index: number;
  step: number;
  left: number;
  height: number;
  reorderable: boolean;
  order: SharedValue<string[]>;
  activeId: SharedValue<string | null>;
  activeTop: SharedValue<number>;
  dragY: SharedValue<number>;
  onGrab: () => void;
  onSettled: (order: string[]) => void;
  children: (handle: GestureResponderHandlers, slot: SharedValue<number>) => ReactNode;
}

function SortableRow({
  id,
  index,
  step,
  left,
  height,
  reorderable,
  order,
  activeId,
  activeTop,
  dragY,
  onGrab,
  onSettled,
  children,
}: SortableRowProps) {
  const reduceMotion = useReducedMotion();
  const top = useSharedValue(index * step);
  const slot = useDerivedValue(() => {
    const at = order.value.indexOf(id);
    return at < 0 ? index : at;
  });

  // Follow the finger while dragged, so letting go picks up from exactly there.
  useAnimatedReaction(
    () => (activeId.value === id ? activeTop.value : null),
    (dragged) => {
      if (dragged !== null) top.set(dragged);
    },
  );

  // Glide to the row's slot whenever it changes; ease in from where it was dropped, then hand
  // the new order over once it's there (unless another drag has started meanwhile).
  useAnimatedReaction(
    () => ({ at: order.value.indexOf(id), active: activeId.value === id }),
    (now, prev) => {
      if (now.active || now.at < 0) return;
      const target = now.at * step;
      if (prev?.active) {
        top.set(
          withTiming(target, SETTLE, (finished) => {
            if (finished && activeId.value === null) scheduleOnRN(onSettled, order.value);
          }),
        );
      } else if (!prev) {
        top.set(target);
      } else if (prev.at !== now.at) {
        top.set(withTiming(target, SETTLE));
      }
    },
  );

  const style = useAnimatedStyle(() => {
    const active = activeId.value === id;
    return {
      top: active ? activeTop.value : top.value,
      zIndex: active ? 2 : 1,
      transform: [{ scale: withTiming(active ? 1.03 : 1, { duration: 140 }) }],
    };
  });

  // Nothing re-renders mid-drag, so this stays the same responder for the whole gesture.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: onGrab,
        onPanResponderMove: (_, g) => dragY.set(g.dy),
        onPanResponderRelease: () => activeId.set(null),
        onPanResponderTerminate: () => activeId.set(null),
      }),
    [activeId, dragY, onGrab],
  );

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(220)}
      exiting={reduceMotion ? undefined : FadeOut.duration(160)}
      className="absolute right-0"
      style={[{ left, height }, style]}
    >
      {children(reorderable ? pan.panHandlers : {}, slot)}
    </Animated.View>
  );
}
