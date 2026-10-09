import { Check } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

// A small floating list of options (the talent role and state pickers, the content platform, the
// planner's actions). `position` places it on screen; a tap outside closes it. Without `selected`
// it's a plain action list.

interface DropdownMenuProps<T extends string> {
  visible: boolean;
  onClose: () => void;
  options: readonly { value: T; label: string }[];
  selected?: T;
  onSelect: (value: T) => void;
  position: ViewStyle;
  label: string;
}

export function DropdownMenu<T extends string>({
  visible,
  onClose,
  options,
  selected,
  onSelect,
  position,
  label,
}: DropdownMenuProps<T>) {
  const reduceMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* A sibling of the menu, not its parent, so the list's scroll isn't taken by it. */}
        <Pressable onPress={onClose} accessibilityLabel="Close" className="absolute inset-0" />
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(150)}
          accessibilityLabel={label}
          className="absolute max-h-80 min-w-[180px] overflow-hidden rounded-2xl border border-white/90 bg-white"
          style={[position, { boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.12)' }]}
        >
          <ScrollView bounces={false} nestedScrollEnabled persistentScrollbar>
            {options.map((option) => {
              const active = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="h-12 flex-row items-center gap-3 px-4 active:bg-[#F8F8F8]"
                >
                  <Text className="flex-1 font-inter-semibold text-sm leading-[17px] text-[#1D1D1F]">
                    {option.label}
                  </Text>
                  {active ? <Check size={16} color="#312B28" strokeWidth={2} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
