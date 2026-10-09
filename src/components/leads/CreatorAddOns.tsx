import { ChevronDown, Clapperboard, type LucideIcon, Scissors, Video } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import type { CreatorAddOn } from '@/services/leadCreatorsService';
import type { TalentRole } from '@/services/talentService';
import { groupDigits } from '@/utils/format';

// Extra talent booked alongside the creator, with what each costs. Folds away from its header.

const ROLE_ICONS: Record<TalentRole, LucideIcon> = { videographer: Video, editor: Scissors };

export function CreatorAddOns({ addOns }: { addOns: CreatorAddOn[] }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);

  return (
    <Animated.View
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      className="gap-2.5 rounded-[22px] p-4"
      style={{
        experimental_backgroundImage:
          'linear-gradient(135deg, rgba(232, 243, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)',
      }}
    >
      <Pressable
        onPress={() => setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={`Add-ons, ${addOns.length}`}
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between pb-1 active:opacity-70"
      >
        <View className="flex-row items-center gap-2">
          <View
            className="h-6 w-6 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
          >
            <Clapperboard size={11} color="#141311" strokeWidth={1.67} />
          </View>
          <Text className="font-inter-bold text-xs leading-4 tracking-[-0.3px] text-[#141311]">
            Add-ons
          </Text>
        </View>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <ChevronDown size={13} color="#8C8A84" strokeWidth={1.67} />
        </View>
      </Pressable>

      {open
        ? addOns.map((addOn) => {
            const Icon = ROLE_ICONS[addOn.role];
            return (
              <Animated.View
                key={addOn.id}
                entering={reduceMotion ? undefined : FadeIn.duration(200)}
                exiting={reduceMotion ? undefined : FadeOut.duration(150)}
                accessible
                accessibilityLabel={`${addOn.title}, ₹${groupDigits(addOn.price)}`}
                className="flex-row items-center gap-3 rounded-xl bg-white/70 p-2.5"
              >
                <Icon size={12} color="#8C8A84" strokeWidth={1.67} />
                <Text className="flex-1 font-inter-semibold text-xs leading-4 text-[#141311]">
                  {addOn.title}
                </Text>
                <Text className="font-inter-bold text-xs leading-4 text-[#141311]">
                  ₹{groupDigits(addOn.price)}
                </Text>
              </Animated.View>
            );
          })
        : null}
    </Animated.View>
  );
}
