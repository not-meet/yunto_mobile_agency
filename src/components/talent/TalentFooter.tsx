import { ChevronDown, MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GLASS_SHADOW, LEVEL_LABELS, ROLE_LABELS, TIER_LABELS } from '@/components/talent/labels';
import { FlameIcon } from '@/components/talent/TalentIcons';
import {
  type IndianState,
  type ShootTier,
  shootTierSchema,
  type TalentRole,
} from '@/services/talentService';

// Under the deck: the shoot tier (three flames, hotter is bigger), which also filters the deck to
// talents at that level (rookie, mid-level, high profile), and the state picker.

const TIERS = shootTierSchema.options;
// From the bottom safe area to the top of the footer's buttons, so a menu can open above them.
export const FOOTER_BUTTONS_TOP = 32 + 44;

interface TalentFooterProps {
  role: TalentRole;
  tier: ShootTier;
  onTierChange: (tier: ShootTier) => void;
  state: IndianState;
  onStatePress: () => void;
  stateExpanded: boolean;
}

export function TalentFooter({
  role,
  tier,
  onTierChange,
  state,
  onStatePress,
  stateExpanded,
}: TalentFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-end justify-between gap-3 px-5 pt-2"
      style={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="w-[148px] gap-2">
        <Text className="pl-1 font-inter-bold text-[11px] uppercase leading-[13px] tracking-[0.5px] text-[#8A8A8E]">
          {ROLE_LABELS[role].tierHeading}
        </Text>
        <View className="flex-row gap-2">
          {TIERS.map((key) => {
            const active = key === tier;
            return (
              <Pressable
                key={key}
                onPress={() => onTierChange(key)}
                accessibilityRole="button"
                accessibilityLabel={`${LEVEL_LABELS[key]} ${ROLE_LABELS[role].plural.toLowerCase()}, ${TIER_LABELS[role][key]}`}
                accessibilityState={{ selected: active }}
                className={`h-11 w-11 items-center justify-center rounded-2xl border active:opacity-80 ${
                  active ? 'border-transparent' : 'border-white/90 bg-white/65'
                }`}
                style={
                  active
                    ? {
                        experimental_backgroundImage:
                          'linear-gradient(135deg, #1D1D1F 0%, #3A3A3C 100%)',
                        boxShadow:
                          '0px 8px 16px rgba(0, 0, 0, 0.15), inset 0px 2px 4px rgba(255, 255, 255, 0.2)',
                      }
                    : { boxShadow: GLASS_SHADOW }
                }
              >
                <FlameIcon tier={key} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="items-end gap-2">
        <Text className="pl-1 font-inter-bold text-[11px] uppercase leading-[13px] tracking-[0.5px] text-[#8A8A8E]">
          Location
        </Text>
        <Pressable
          onPress={onStatePress}
          accessibilityRole="button"
          accessibilityLabel={`Location, ${state}. Change state`}
          accessibilityState={{ expanded: stateExpanded }}
          className="h-11 flex-row items-center gap-2 rounded-2xl border border-white/90 bg-white/65 px-[18px] active:opacity-80"
          style={{ boxShadow: GLASS_SHADOW }}
        >
          <MapPin size={16} color="#8A8A8E" strokeWidth={1.33} />
          <Text
            numberOfLines={1}
            className="max-w-[110px] text-center font-inter-bold text-sm leading-[17px] text-[#1D1D1F]"
          >
            {state}
          </Text>
          <ChevronDown size={18} color="#8A8A8E" strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
}
