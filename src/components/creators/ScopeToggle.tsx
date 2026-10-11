import { Pressable, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { SCOPE_OPTIONS } from '@/components/creators/labels';
import type { CreatorScope } from '@/services/creatorsService';

// Our roster or every creator on Yunto: two halves of a white pill, the picked one dark.

interface ScopeToggleProps {
  value: CreatorScope;
  onChange: (next: CreatorScope) => void;
}

export function ScopeToggle({ value, onChange }: ScopeToggleProps) {
  const reduceMotion = useReducedMotion();
  const ease = (property: 'backgroundColor' | 'color') =>
    reduceMotion ? null : { transitionProperty: property, transitionDuration: 200 };

  return (
    <View
      accessibilityRole="radiogroup"
      className="h-[59px] flex-row rounded-2xl border border-[rgba(232,229,223,0.1)] bg-white p-1"
      style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)' }}
    >
      {SCOPE_OPTIONS.map(({ key, label }) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            className="flex-1 active:opacity-80"
          >
            <Animated.View
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                backgroundColor: selected ? '#141311' : 'transparent',
                boxShadow: selected ? '0px 4px 14px rgba(0, 0, 0, 0.12)' : undefined,
                ...ease('backgroundColor'),
              }}
            >
              <Animated.Text
                className={`text-[13px] leading-5 ${selected ? 'font-inter-bold' : 'font-inter-semibold'}`}
                style={{ color: selected ? '#FAF7F2' : '#8C8A84', ...ease('color') }}
              >
                {label}
              </Animated.Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}
