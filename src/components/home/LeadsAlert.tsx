import { router } from 'expo-router';
import { ArrowRight, Inbox } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CARD_SHADOW, GLOW } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';

// Nudge card for leads nobody has picked up yet; opens the leads list narrowed to them. Hidden
// when there are none.

export function LeadsAlert({ count }: { count: number }) {
  const press = usePressScale();
  if (count === 0) return null;
  const title = `${count} new lead${count === 1 ? '' : 's'} waiting`;

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={() => router.push({ pathname: '/leads', params: { filter: 'needs-response' } })}
        accessibilityRole="button"
        accessibilityLabel={`${title}. Tap to review pipeline`}
        className="flex-row items-center justify-between overflow-hidden rounded-3xl border border-sand bg-[#E2EBE2] p-5"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <View
          pointerEvents="none"
          className="absolute -right-[15px] -top-[15px] h-24 w-24 rounded-full bg-[rgba(212,226,212,0.3)]"
          style={GLOW}
        />
        <View className="flex-row items-center gap-4">
          <View
            className="h-10 w-10 items-center justify-center rounded-full bg-white/50"
            style={{ boxShadow: 'inset 0px 0.9px 0px rgba(255, 255, 255, 0.8)' }}
          >
            <Inbox size={20} color="#1E1E1E" strokeWidth={1.5} />
          </View>
          <View className="gap-[1.5px]">
            <Text className="font-geist-medium text-base leading-6 text-charcoal">{title}</Text>
            <Text className="font-inter text-xs leading-4 text-charcoal/70">
              Tap to review pipeline
            </Text>
          </View>
        </View>
        <View
          className="h-8 w-8 items-center justify-center rounded-full bg-espresso"
          style={{
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
          }}
        >
          <ArrowRight size={16} color="#F9F6EE" strokeWidth={1.33} />
        </View>
      </Pressable>
    </Animated.View>
  );
}
