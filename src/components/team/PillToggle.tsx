import { Pressable, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

// The team screens' on/off switch: a pill whose knob slides across, filled in when on. "violet"
// is the team header's gradient; "green" the member's permission rows.

const TONES = {
  violet: {
    on: {
      experimental_backgroundImage: 'linear-gradient(119.48deg, #7A8AE8 0%, #9B6EDD 100%)',
      boxShadow: '0px 2px 8px rgba(122, 138, 232, 0.35)',
    },
    width: 46,
    track: 'h-[26px] w-[46px]',
    knob: 20,
  },
  green: {
    on: { backgroundColor: '#05DF72', boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.05)' },
    width: 48,
    track: 'h-6 w-12',
    knob: 16,
  },
} as const;

interface PillToggleProps {
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
  tone: keyof typeof TONES;
  disabled?: boolean;
}

export function PillToggle({ value, onChange, label, tone, disabled = false }: PillToggleProps) {
  const reduceMotion = useReducedMotion();
  const style = TONES[tone];
  // Track width less the knob and the 4px padding either side.
  const travel = style.width - style.knob - 8;

  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      className={`${style.track} justify-center rounded-full px-1 ${value ? '' : 'bg-[#E2E8F0]'} ${
        disabled ? 'opacity-60' : ''
      }`}
      style={value ? style.on : undefined}
    >
      <Animated.View
        style={{
          transform: [{ translateX: value ? travel : 0 }],
          ...(reduceMotion ? null : { transitionProperty: 'transform', transitionDuration: 180 }),
        }}
      >
        <View
          className="rounded-full bg-white"
          style={{
            width: style.knob,
            height: style.knob,
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
