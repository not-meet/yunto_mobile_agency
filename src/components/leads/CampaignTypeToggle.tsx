import { Pressable, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { FieldLabel } from '@/components/leads/FieldLabel';
import { DEAL_LABELS } from '@/components/leads/labels';
import type { DealType } from '@/services/leadsService';

// Barter or paid: two pills side by side, the picked one dark.

const OPTIONS: DealType[] = ['barter', 'paid'];

interface CampaignTypeToggleProps {
  value: DealType;
  onChange: (next: DealType) => void;
}

export function CampaignTypeToggle({ value, onChange }: CampaignTypeToggleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <View className="gap-3">
      <FieldLabel>Campaign Type</FieldLabel>
      <View accessibilityRole="radiogroup" className="flex-row gap-2">
        {OPTIONS.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="radio"
              accessibilityLabel={DEAL_LABELS[option]}
              accessibilityState={{ selected }}
              className="flex-1 active:opacity-80"
            >
              <Animated.View
                className="h-[46px] items-center justify-center rounded-full border"
                style={{
                  backgroundColor: selected ? '#312B28' : '#FFFFFF',
                  borderColor: selected ? '#312B28' : '#EAEAEA',
                  boxShadow: selected
                    ? '0px 4px 12px rgba(0, 0, 0, 0.12)'
                    : '0px 2px 8px rgba(0, 0, 0, 0.02)',
                  transitionProperty: ['backgroundColor', 'borderColor'],
                  transitionDuration: reduceMotion ? 0 : 180,
                }}
              >
                <Text
                  className={`font-inter-semibold text-[13px] leading-5 ${
                    selected ? 'text-white' : 'text-[#555555]'
                  }`}
                >
                  {DEAL_LABELS[option]}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
