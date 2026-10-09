import { Pressable, ScrollView, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Pill options on the booking screen, in a sideways-scrolling row. A selected chip takes the
// row's tint (blue, or green for time slots); chips squeeze a little under the finger and fade
// between states.

const TONES = {
  blue: {
    background: '#E3F2FD',
    border: '#BBDEFB',
    text: '#1565C0',
    shadow: '0px 4px 12px rgba(21, 101, 192, 0.1)',
  },
  green: {
    background: '#E8F5E9',
    border: '#C8E6C9',
    text: '#2E7D32',
    shadow: '0px 4px 12px rgba(46, 125, 50, 0.1)',
  },
} as const;
const IDLE = {
  background: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.9)',
  text: '#555555',
  shadow: '0px 2px 6px rgba(0, 0, 0, 0.02)',
};

type ChipTone = keyof typeof TONES;

// Adds `value` to a multi-select list, or takes it out if it's already there.
export function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  tone: ChipTone;
  disabled?: boolean;
}

function ChoiceChip({ label, selected, onPress, tone, disabled = false }: ChoiceChipProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const colors = selected ? TONES[tone] : IDLE;

  const squeeze = (to: number) => {
    if (!reduceMotion) scale.set(withSpring(to, { damping: 15, stiffness: 400 }));
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => squeeze(0.94)}
      onPressOut={() => squeeze(1)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      className={disabled ? 'opacity-40' : ''}
    >
      <Animated.View style={pressStyle}>
        <Animated.View
          className="rounded-[20px] border px-4 py-2.5"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            boxShadow: colors.shadow,
            transitionProperty: ['backgroundColor', 'borderColor'],
            transitionDuration: reduceMotion ? 0 : 180,
          }}
        >
          <Text
            className="font-inter-semibold text-[13px] leading-4"
            style={{ color: colors.text }}
          >
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

interface ChipGroupProps<T extends string> {
  options: readonly T[];
  labels: Record<T, string>;
  selected: readonly T[];
  // Single-select rows replace the choice, multi-select rows toggle it.
  onPress: (value: T) => void;
  tone?: ChipTone;
  // Options that can't be picked right now (e.g. a time slot that's already passed).
  isDisabled?: (value: T) => boolean;
}

export function ChipGroup<T extends string>({
  options,
  labels,
  selected,
  onPress,
  tone = 'blue',
  isDisabled,
}: ChipGroupProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      // Bleeds past the section's edge so the chip shadows aren't clipped.
      className="-mx-1 grow-0"
      contentContainerStyle={{ gap: 10, padding: 4 }}
    >
      {options.map((option) => (
        <ChoiceChip
          key={option}
          label={labels[option]}
          selected={selected.includes(option)}
          onPress={() => onPress(option)}
          tone={tone}
          disabled={isDisabled?.(option)}
        />
      ))}
    </ScrollView>
  );
}
