import { Check, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showToast } from '@/utils/notifications';

// Pinned under a profile: Skip (back to browsing), deselect and select.

// Bar height above the safe area, so the scroll content can clear it.
export const PROFILE_ACTIONS_HEIGHT = 108;

interface TalentProfileActionsProps {
  name: string;
  selected: boolean;
  // False when the profile wasn't opened from a lead, so there's nothing to select for.
  canSelect: boolean;
  onSkip: () => void;
  onSelect: () => void;
  onDeselect: () => void;
}

export function TalentProfileActions({
  name,
  selected,
  canSelect,
  onSkip,
  onSelect,
  onDeselect,
}: TalentProfileActionsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row items-start justify-between px-5 pt-4"
      style={{
        paddingBottom: insets.bottom + 32,
        experimental_backgroundImage:
          'linear-gradient(0deg, #FAF9F6 60%, rgba(250, 249, 246, 0) 100%)',
      }}
    >
      <Pressable
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip"
        className="h-[59px] w-32 items-center justify-center rounded-[30px] border border-white/60 bg-white/60 active:opacity-80"
        style={{ boxShadow: '0px 12px 24px rgba(26, 26, 26, 0.2)' }}
      >
        <Text className="text-center font-inter-medium text-sm leading-[17px] text-[#1A1A1A]">
          Skip
        </Text>
      </Pressable>
      <Pressable
        onPress={onDeselect}
        disabled={!selected}
        accessibilityRole="button"
        accessibilityLabel={`Deselect ${name}`}
        accessibilityState={{ disabled: !selected }}
        className={`h-[60px] w-[60px] items-center justify-center rounded-full border border-[#EAEAEA] bg-white active:opacity-80 ${
          selected ? '' : 'opacity-50'
        }`}
        style={{ boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.04)' }}
      >
        <X size={28} color="#FF5252" strokeWidth={2.33} />
      </Pressable>
      <Pressable
        onPress={
          canSelect
            ? onSelect
            : () => showToast('Open this profile from a lead or campaign to select them')
        }
        disabled={canSelect && selected}
        accessibilityRole="button"
        accessibilityLabel={selected ? `${name} is selected` : `Select ${name}`}
        accessibilityState={{ disabled: !canSelect || selected, selected }}
        className={`h-[60px] w-[60px] items-center justify-center rounded-full bg-cocoa active:opacity-80 ${
          canSelect ? '' : 'opacity-50'
        }`}
        style={{ boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.04)' }}
      >
        <Check size={28} color="#FFFFFF" strokeWidth={2.33} />
      </Pressable>
    </View>
  );
}
