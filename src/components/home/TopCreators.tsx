import { Image, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { SectionHeader } from '@/components/home/SectionHeader';
import { CARD_SHADOW, comingSoon } from '@/components/home/shared';
import type { HomeDashboard } from '@/services/homeService';
import { formatInr } from '@/utils/format';

// The two creators bringing in the most revenue this month.

const SHOWN = 2;

export function TopCreators({ creators }: { creators: HomeDashboard['topCreators'] }) {
  return (
    <View className="gap-4">
      {/* TODO(creators): open the creators list once that screen exists. */}
      <SectionHeader
        title="Top Creators"
        action={{ label: 'See all', onPress: () => comingSoon('Creators') }}
      />
      <View
        className="gap-2 rounded-[28px] border border-sand bg-white/40 p-2"
        style={{ boxShadow: CARD_SHADOW }}
      >
        {creators.slice(0, SHOWN).map((creator, index) => (
          <Animated.View
            key={creator.id}
            entering={FadeInRight.delay(200 + index * 80).duration(300)}
            className="flex-row items-center gap-4 rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white p-3"
            style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)' }}
          >
            <Image
              source={{ uri: creator.avatarUrl }}
              accessibilityIgnoresInvertColors
              className="h-12 w-12 rounded-full bg-sand"
            />
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="font-inter-bold text-[15px] leading-[22px] text-charcoal"
              >
                {creator.name}
              </Text>
              <Text
                numberOfLines={1}
                className="font-inter-medium text-xs leading-4 text-charcoal/60"
              >
                {creator.niche}
              </Text>
            </View>
            <View className="items-end pr-2">
              <Text className="font-inter-bold text-[15px] leading-[22px] text-charcoal">
                {formatInr(creator.revenue)}
              </Text>
              <Text className="font-inter-semibold text-[10px] uppercase leading-[15px] tracking-[0.5px] text-charcoal/50">
                MTD
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
