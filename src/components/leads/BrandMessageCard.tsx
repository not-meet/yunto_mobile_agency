import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

// The brand's opening message, clipped to four lines until it's tapped open (the chevron turns
// as it does). null until the brand sends one: a "No brief yet" line with nothing to open.

const COLLAPSED_LINES = 4;

export function BrandMessageCard({ message }: { message: string | null }) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      className="overflow-hidden rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-8"
    >
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        disabled={message === null}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          message === null
            ? 'Brand message, no brief yet'
            : expanded
              ? 'Collapse brand message'
              : 'Show full brand message'
        }
        className="gap-3 active:opacity-80"
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">
            Brand Message
          </Text>
          {message !== null ? (
            <Animated.View
              style={{
                transform: [{ rotate: expanded ? '180deg' : '0deg' }],
                ...(reduceMotion
                  ? null
                  : { transitionProperty: 'transform', transitionDuration: 250 }),
              }}
            >
              <ChevronDown size={20} color="#8A8A8E" strokeWidth={1.67} />
            </Animated.View>
          ) : null}
        </View>
        <Text
          numberOfLines={expanded ? undefined : COLLAPSED_LINES}
          className="font-inter text-sm leading-[21px] text-[#6E6E73]"
        >
          {message ?? 'No brief yet'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
