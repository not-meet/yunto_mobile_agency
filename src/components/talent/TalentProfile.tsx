import { Image } from 'expo-image';
import { MapPin, MessageCircle } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { TIER_LABELS } from '@/components/talent/labels';
import { PastWork } from '@/components/talent/PastWork';
import { ExpertiseTags, TalentStats } from '@/components/talent/TalentHighlights';
import type { ShootTier, Talent } from '@/services/talentService';
import { groupDigits } from '@/utils/format';

// A talent's full profile: hero photo with their name over it, the price for the chosen tier
// overlapping its bottom edge, their pitch,
// then their expertise, stats and past work.

const HERO_SHADE =
  'linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0) 100%)';
const PRICE_GRADIENT =
  'radial-gradient(92.83% 170.66% at 18% 20%, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 20%), radial-gradient(93.35% 171.6% at 82% 18%, rgba(246, 214, 74, 0.3) 0%, rgba(246, 214, 74, 0) 18%), radial-gradient(86.46% 158.94% at 72% 88%, rgba(247, 183, 218, 0.4) 0%, rgba(247, 183, 218, 0) 22%), linear-gradient(118.54deg, rgba(255, 229, 164, 0.82) 0%, rgba(255, 245, 228, 0.92) 35%, rgba(244, 211, 238, 0.88) 72%, rgba(202, 217, 255, 0.76) 100%)';

export function TalentProfile({ talent, tier }: { talent: Talent; tier: ShootTier }) {
  // null when they haven't priced this tier.
  const rate = talent.rates[tier];
  return (
    <View className="gap-4">
      <View>
        <View
          className="h-[460px] overflow-hidden rounded-[28px] bg-[#EAEAEA]"
          style={{ boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.08)' }}
        >
          {/* No photo yet: the grey tile stays as the placeholder. */}
          {talent.photoUrl ? (
            <Image
              source={{ uri: talent.photoUrl }}
              recyclingKey={talent.id}
              contentFit="cover"
              transition={250}
              cachePolicy="memory-disk"
              accessible={false}
              style={{ flex: 1 }}
            />
          ) : null}
          <View
            className="absolute bottom-0 left-0 right-0 h-[290px] justify-end gap-1 px-6 pb-[72px] pt-20"
            style={{ experimental_backgroundImage: HERO_SHADE }}
          >
            {talent.replyTime ? (
              <View className="flex-row items-center gap-1 self-start rounded-[14px] border border-white/30 bg-white/20 px-3 py-1.5">
                <MessageCircle size={12} color="#FFFFFF" strokeWidth={1} />
                <Text className="font-inter-bold text-[11px] uppercase leading-[13px] tracking-[0.55px] text-white">
                  {talent.replyTime} reply
                </Text>
              </View>
            ) : null}
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              className="pt-2 font-inter-bold text-[32px] leading-[35px] text-white"
            >
              {talent.name}
            </Text>
            <Text className="font-inter-medium text-[15px] leading-[21px] text-white/90">
              {talent.specialty}
            </Text>
            <View className="flex-row items-center gap-1.5 pt-1">
              <MapPin size={14} color="rgba(255, 255, 255, 0.7)" strokeWidth={1.17} />
              <Text className="font-inter-medium text-[13px] leading-4 text-white/70">
                {talent.location.area}, {talent.location.state}
              </Text>
            </View>
          </View>
        </View>

        <View
          className="-mt-10 w-[303px] max-w-full self-center rounded-3xl border border-white bg-[#FFF5E4] px-5 py-[22px]"
          style={{
            experimental_backgroundImage: PRICE_GRADIENT,
            boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <View className="flex-row items-center justify-center gap-[9.7px]">
            <Text className="text-center font-inter-bold text-lg leading-[22px] text-[#7E57C2]">
              {rate === null ? 'Price on request' : `₹${groupDigits(rate)}`}
            </Text>
            <View className="h-4 w-px bg-[#E0E0E0]" />
            <Text className="text-center font-inter-bold text-lg leading-[22px] text-[#1A1A1A]">
              {TIER_LABELS[talent.role][tier]}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="rounded-3xl border border-white/90 bg-white/60 px-5 pb-5 pt-[19.25px]"
        style={{ boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)' }}
      >
        <Text className="font-inter-medium text-[15px] leading-[22px] text-[#444444]">
          “{talent.bio}”
        </Text>
      </View>

      <View className="gap-6 pt-2">
        <ExpertiseTags tags={talent.expertise} />
        <TalentStats talent={talent} />
        <PastWork items={talent.pastWork} />
      </View>
    </View>
  );
}
