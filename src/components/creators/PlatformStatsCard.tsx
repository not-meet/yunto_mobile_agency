import { ArrowUpRight, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { CREATOR_PLATFORM_STYLES } from '@/components/creators/labels';
import { ProfilePanel } from '@/components/creators/ProfilePanel';
import { openLink } from '@/components/leads/contact';
import type { PlatformStats } from '@/services/creatorsService';
import { formatCount } from '@/utils/format';

// One of a creator's platforms on their profile: followers (subscribers on YouTube), and
// engagement, likes and comments under it. "View profile" opens their page on the platform, when
// known; the rest of the header folds the numbers away.

// Each platform's corner glow, as an rgb triple.
const GLOWS: Record<string, string> = {
  instagram: '255, 205, 225',
  youtube: '255, 210, 210',
};
const DEFAULT_GLOW = '205, 220, 255';

export function PlatformStatsCard({ stats }: { stats: PlatformStats }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const style = CREATOR_PLATFORM_STYLES[stats.platform];
  const Icon = style.icon;
  const audience = stats.platform === 'youtube' ? 'Subscribers' : 'Followers';
  const url = stats.url;

  const numbers = [
    { label: 'Eng.', value: `${stats.engagementRate}%`, color: style.color },
    { label: 'Likes', value: formatCount(stats.avgLikes), color: '#111111' },
    { label: 'Comments', value: formatCount(stats.avgComments), color: '#111111' },
  ];

  return (
    <ProfilePanel glow={GLOWS[stats.platform] ?? DEFAULT_GLOW}>
      <View className="flex-row items-center gap-3 px-5 py-4">
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={`${style.label}, ${formatCount(stats.followers)} ${audience}`}
          accessibilityState={{ expanded: open }}
          className="flex-1 flex-row items-center gap-3 active:opacity-80"
        >
          <View
            className="h-9 w-9 items-center justify-center rounded-full border"
            style={{ backgroundColor: style.tint, borderColor: 'rgba(200, 170, 220, 0.3)' }}
          >
            {Icon ? <Icon size={16} color={style.color} /> : null}
          </View>
          <View className="flex-1">
            <Text className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]">
              {style.label}
            </Text>
            <Text className="font-inter-medium text-xs leading-[18px] text-black/40">
              {formatCount(stats.followers)} {audience}
            </Text>
          </View>
        </Pressable>
        {url ? (
          <Pressable
            onPress={() => openLink(url)}
            hitSlop={6}
            accessibilityRole="link"
            accessibilityLabel={`View ${style.label} profile`}
            className="h-[27px] flex-row items-center gap-1 rounded-full border px-2.5 active:opacity-70"
            style={{ backgroundColor: style.tint, borderColor: 'rgba(0, 0, 0, 0.06)' }}
          >
            <Text className="font-inter-bold text-[11px] leading-4" style={{ color: style.color }}>
              View profile
            </Text>
            <ArrowUpRight size={12} color={style.color} strokeWidth={2} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => setOpen((o) => !o)}
          hitSlop={8}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="active:opacity-60"
        >
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
      </View>

      {open ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(180)}
          className="flex-row"
        >
          {numbers.map((n, i) => (
            <View
              key={n.label}
              accessible
              accessibilityLabel={`${n.label}, ${n.value}`}
              className={`flex-1 items-center gap-1 px-4 py-3 ${
                i < numbers.length - 1 ? 'border-r border-black/5' : ''
              }`}
            >
              <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[1px] text-[#AAAAAA]">
                {n.label}
              </Text>
              <Text className="font-inter-semibold text-base leading-6" style={{ color: n.color }}>
                {n.value}
              </Text>
            </View>
          ))}
        </Animated.View>
      ) : null}
    </ProfilePanel>
  );
}
