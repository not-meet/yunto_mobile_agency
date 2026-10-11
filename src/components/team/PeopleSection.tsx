import { ChevronDown, type LucideIcon } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { ProfilePanel } from '@/components/creators/ProfilePanel';

// One of the People screen's cards: a header with a tinted icon that folds the card's content
// away and back. Opens unfolded.

interface PeopleSectionProps {
  title: string;
  icon: LucideIcon;
  // Icon colour and its tile's tint.
  tone: { color: string; background: string };
  // The corner glow, as "r, g, b".
  glow: string;
  // The overview's larger, rounded-square tile.
  large?: boolean;
  children: ReactNode;
}

export function PeopleSection({
  title,
  icon: Icon,
  tone,
  glow,
  large = false,
  children,
}: PeopleSectionProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);

  return (
    <Animated.View layout={reduceMotion ? undefined : LinearTransition.duration(240)}>
      <ProfilePanel glow={glow}>
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ expanded: open }}
          className="flex-row items-center gap-3 px-5 py-4 active:opacity-80"
        >
          <View
            className={`items-center justify-center ${large ? 'h-12 w-12 rounded-[20px]' : 'h-9 w-9 rounded-full'}`}
            style={{
              backgroundColor: tone.background,
              boxShadow: large ? '0px 4px 12px rgba(0, 0, 0, 0.03)' : undefined,
            }}
          >
            <Icon size={large ? 24 : 16} color={tone.color} strokeWidth={2} />
          </View>
          <Text
            accessibilityRole="header"
            className="flex-1 font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
          >
            {title}
          </Text>
          <Animated.View
            style={{
              transform: [{ rotate: open ? '180deg' : '0deg' }],
              ...(reduceMotion
                ? null
                : { transitionProperty: 'transform', transitionDuration: 200 }),
            }}
          >
            <ChevronDown size={16} color="#BBBBBB" strokeWidth={2} />
          </Animated.View>
        </Pressable>
        {open ? (
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(220)}>
            {children}
          </Animated.View>
        ) : null}
      </ProfilePanel>
    </Animated.View>
  );
}
