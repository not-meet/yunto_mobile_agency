import { Pressable, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { CHANNEL_OPTIONS } from '@/components/profile/distributionLabels';
import type { DistributionChannel } from '@/services/leadDistributionService';

// Leads or Campaigns: two halves of a sand pill, the picked one dark.

interface DistributionChannelToggleProps {
  value: DistributionChannel;
  onChange: (next: DistributionChannel) => void;
}

export function DistributionChannelToggle({ value, onChange }: DistributionChannelToggleProps) {
  const reduceMotion = useReducedMotion();
  const ease = (property: 'backgroundColor' | 'color') =>
    reduceMotion ? null : { transitionProperty: property, transitionDuration: 200 };

  return (
    <View accessibilityRole="tablist" className="h-[46px] flex-row rounded-full bg-[#ECE7DF] p-1">
      {CHANNEL_OPTIONS.map(({ key, label }) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            className="flex-1 active:opacity-80"
          >
            <Animated.View
              className="flex-1 items-center justify-center rounded-full"
              style={{
                backgroundColor: selected ? '#221F1B' : 'transparent',
                boxShadow: selected ? '0px 1px 2px rgba(0, 0, 0, 0.05)' : undefined,
                ...ease('backgroundColor'),
              }}
            >
              <Animated.Text
                className={`text-xs leading-4 ${selected ? 'font-inter-bold' : 'font-inter-medium'}`}
                style={{ color: selected ? '#FFFFFF' : '#767169', ...ease('color') }}
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
