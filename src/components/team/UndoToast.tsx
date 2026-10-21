import { Check } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, useReducedMotion } from 'react-native-reanimated';

// The dark toast at the foot of Assign Creators' lists after a change, with Undo. Shown through
// `useUndoToast`, which hides it again after a few seconds.

const SHOWN_MS = 6000;

export interface UndoableChange {
  // e.g. "2 creators assigned to Neeraj".
  message: string;
  undo: () => void;
}

export function useUndoToast() {
  const [toast, setToast] = useState<(UndoableChange & { id: number }) | null>(null);

  const show = useCallback((change: UndoableChange) => {
    const id = Date.now();
    setToast({ ...change, id });
    // Only hides this one: a newer toast keeps its own time.
    setTimeout(() => setToast((now) => (now?.id === id ? null : now)), SHOWN_MS);
  }, []);
  const hide = useCallback(() => setToast(null), []);

  return { toast, show, hide };
}

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  undoing: boolean;
}

export function UndoToast({ message, onUndo, undoing }: UndoToastProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(220)}
      exiting={reduceMotion ? undefined : FadeOutDown.duration(180)}
      accessibilityLiveRegion="polite"
      className="flex-row items-center justify-between gap-3 rounded-[43px] border border-white/5 bg-cocoa px-3.5 py-3"
      style={{ boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]">
          <Check size={14} color="#FFFFFF" strokeWidth={1.75} />
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-xs leading-[15px] tracking-[-0.3px] text-white"
          >
            {message}
          </Text>
          <Text
            numberOfLines={1}
            className="pt-px font-inter text-[11px] leading-[14px] text-[#9CA3AF]"
          >
            Synced across the team instantly.
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onUndo}
        disabled={undoing}
        accessibilityRole="button"
        accessibilityLabel="Undo"
        accessibilityState={{ busy: undoing }}
        className="h-8 min-w-[63px] items-center justify-center rounded-full bg-white px-4 active:opacity-80"
        style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
      >
        {undoing ? (
          <ActivityIndicator size="small" color="#111827" />
        ) : (
          <Text className="font-inter-semibold text-xs leading-4 text-[#111827]">Undo</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
