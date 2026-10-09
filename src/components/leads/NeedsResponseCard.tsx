import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';

// Pinned above the leads list: how many leads nobody has replied to yet. "Review now" narrows the
// list to them, and "Show all" (while reviewing) widens it again. The line cross-fades as it
// switches.

interface NeedsResponseCardProps {
  count: number;
  reviewing: boolean;
  onToggle: () => void;
}

export function NeedsResponseCard({ count, reviewing, onToggle }: NeedsResponseCardProps) {
  const reduceMotion = useReducedMotion();
  const press = usePressScale(0.94);
  const leads = `${count} ${count === 1 ? 'lead needs' : 'leads need'} response`;
  const title = reviewing ? `Showing ${leads}` : count > 0 ? leads : 'You’ve replied to every lead';
  const action = reviewing ? 'Show all' : count > 0 ? 'Review now' : null;

  return (
    <View
      className="h-16 flex-row items-center justify-between gap-3 rounded-2xl bg-[#E1EBE1] px-5"
      style={{ boxShadow: '0px 8px 16px rgba(254, 229, 241, 0.4)' }}
    >
      <Animated.Text
        key={title}
        entering={reduceMotion ? undefined : FadeIn.duration(220)}
        exiting={reduceMotion ? undefined : FadeOut.duration(120)}
        numberOfLines={1}
        accessibilityLiveRegion="polite"
        className="flex-1 font-inter-bold text-sm leading-[18px] text-[#1D1D1F]"
      >
        {title}
      </Animated.Text>
      {action ? (
        <Animated.View style={press.style}>
          <Pressable
            {...press.handlers}
            onPress={onToggle}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={reviewing ? 'Show all leads' : `${leads}. Review now`}
            className="h-8 justify-center rounded-full bg-cocoa px-3"
          >
            <Text className="text-center font-inter-semibold text-xs leading-[15px] text-canvas">
              {action}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}
