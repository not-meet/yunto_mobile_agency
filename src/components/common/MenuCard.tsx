import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';

// A frosted card with a tinted icon tile and a title (the profile's info cards, the team
// screens' menus). With `expanded` it opens in place to show `children` under its header;
// without, it's a link to another screen and its chevron points right.

interface MenuCardProps {
  title: string;
  icon: LucideIcon;
  // Icon colour and its tile's tint.
  tone: { color: string; background: string };
  onPress: () => void;
  expanded?: boolean;
  children?: ReactNode;
}

export function MenuCard({ title, icon: Icon, tone, onPress, expanded, children }: MenuCardProps) {
  const reduceMotion = useReducedMotion();
  const press = usePressScale(0.98);
  const link = expanded === undefined;
  const open = expanded === true;

  return (
    <Animated.View
      layout={reduceMotion ? undefined : LinearTransition.duration(240)}
      className={`rounded-[28px] border border-white/90 p-3 ${open ? 'bg-white/60' : 'bg-white/55'}`}
      style={{
        boxShadow: open
          ? '0px 16px 40px -8px rgba(0, 0, 0, 0.08)'
          : '0px 12px 32px -8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Animated.View style={press.style}>
        <Pressable
          {...press.handlers}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={link ? undefined : { expanded: open }}
          className="flex-row items-center gap-4"
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-[20px]"
            style={{
              backgroundColor: tone.background,
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Icon size={24} color={tone.color} strokeWidth={2} />
          </View>
          <Text
            numberOfLines={1}
            className="flex-1 font-inter-semibold text-base leading-[19px] text-[#111827]"
          >
            {title}
          </Text>
          <View
            className="mr-1 h-9 w-9 items-center justify-center rounded-full bg-white/60"
            style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)' }}
          >
            {link ? (
              <ChevronRight size={20} color="#6B7280" strokeWidth={1.67} />
            ) : (
              <Animated.View
                style={{
                  transform: [{ rotate: open ? '180deg' : '0deg' }],
                  ...(reduceMotion
                    ? null
                    : { transitionProperty: 'transform', transitionDuration: 200 }),
                }}
              >
                <ChevronDown size={20} color="#6B7280" strokeWidth={1.67} />
              </Animated.View>
            )}
          </View>
        </Pressable>
      </Animated.View>

      {open && children ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(220)}
          className="mt-1 border-t border-white/60 px-1 pt-4"
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
