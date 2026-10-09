import { Pressable, Text, View } from 'react-native';

import { Switch } from '@/components/common/Switch';
import { SECTION_SHADOW } from '@/components/talent/labels';
import { ADD_ON_PRICES, type EditorAddOn, type VideographerAddOn } from '@/services/talentService';
import { groupDigits } from '@/utils/format';

// Paid extras on the booking screen, each with its price and a switch. Editors get the roomier
// card, videographers the compact one.

interface BookingAddOnsProps<T extends EditorAddOn | VideographerAddOn> {
  options: readonly T[];
  labels: Record<T, string>;
  selected: readonly T[];
  onToggle: (addOn: T) => void;
  compact?: boolean;
}

export function BookingAddOns<T extends EditorAddOn | VideographerAddOn>({
  options,
  labels,
  selected,
  onToggle,
  compact = false,
}: BookingAddOnsProps<T>) {
  return (
    <View
      className={`rounded-3xl border border-white/90 bg-white/70 ${compact ? 'gap-4 p-4' : 'gap-2 p-5'}`}
      style={{ boxShadow: SECTION_SHADOW }}
    >
      <Text
        accessibilityRole="header"
        className={`font-inter-bold text-[#1A1A1A] ${
          compact ? 'text-[15px] leading-[18px]' : 'text-base leading-[19px]'
        }`}
      >
        Add-ons
      </Text>
      <View>
        {options.map((addOn, i) => {
          const on = selected.includes(addOn);
          const first = i === 0;
          const last = i === options.length - 1;
          const price = `+₹${groupDigits(ADD_ON_PRICES[addOn])}`;
          return (
            <Pressable
              key={addOn}
              onPress={() => onToggle(addOn)}
              accessibilityRole="switch"
              accessibilityLabel={`${labels[addOn]}, ${price}`}
              accessibilityState={{ checked: on }}
              className={`flex-row items-center justify-between gap-4 active:opacity-70 ${
                last ? '' : 'border-b border-black/[0.04]'
              } ${compact ? 'py-3' : first ? 'pb-3.5' : last ? 'pt-3.5' : 'py-3.5'} ${
                compact && last ? 'pb-0' : ''
              }`}
            >
              <View className={`shrink ${compact ? 'gap-0.5' : 'gap-[3px]'}`}>
                <Text className="font-inter-semibold text-sm leading-[17px] text-[#1A1A1A]">
                  {labels[addOn]}
                </Text>
                <Text className="font-inter-medium text-[13px] leading-4 text-[#666666]">
                  {price}
                </Text>
              </View>
              <Switch value={on} onValueChange={() => onToggle(addOn)} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
