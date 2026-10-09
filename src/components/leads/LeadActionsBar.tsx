import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePressScale } from '@/hooks/usePressScale';

// Pinned to the bottom of a lead: follow up, or convert it into a campaign. It floats over the
// content, so the screen pads its scroll view with useLeadActionsBarClearance().

const BUTTON_HEIGHT = 51;
const PADDING_TOP = 16;

function useBottomPadding(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 16) + 16;
}

export function useLeadActionsBarClearance(): number {
  return useBottomPadding() + PADDING_TOP + BUTTON_HEIGHT + 16;
}

interface LeadActionsBarProps {
  onFollowUp: () => void;
  onConvert: () => void;
  // Already a campaign: the button reads "Converted" and can't be pressed.
  converted: boolean;
}

export function LeadActionsBar({ onFollowUp, onConvert, converted }: LeadActionsBarProps) {
  const paddingBottom = useBottomPadding();
  const followPress = usePressScale();
  const convertPress = usePressScale();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row gap-3 bg-[rgba(246,239,233,0.85)] px-5 pt-4"
      style={{ paddingBottom }}
    >
      <Animated.View style={followPress.style} className="flex-1">
        <Pressable
          {...followPress.handlers}
          onPress={onFollowUp}
          accessibilityRole="button"
          className="h-[51px] items-center justify-center rounded-3xl border border-white/60 bg-white/60"
          style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}
        >
          <Text className="text-center font-inter-medium text-sm leading-[17px] text-espresso">
            Follow Up
          </Text>
        </Pressable>
      </Animated.View>
      <Animated.View style={convertPress.style} className="flex-1">
        <Pressable
          {...convertPress.handlers}
          onPress={onConvert}
          disabled={converted}
          accessibilityRole="button"
          accessibilityState={{ disabled: converted }}
          className={`h-[51px] items-center justify-center rounded-3xl bg-cocoa ${
            converted ? 'opacity-50' : ''
          }`}
          style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}
        >
          <Text className="text-center font-inter-medium text-sm leading-[17px] text-white">
            {converted ? 'Converted' : 'Mark Converted'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
