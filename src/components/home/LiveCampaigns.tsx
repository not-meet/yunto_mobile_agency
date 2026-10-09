import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { SectionHeader } from '@/components/home/SectionHeader';
import { CARD_SHADOW, GLOW, comingSoon } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';
import type { HomeDashboard } from '@/services/homeService';
import { formatInr } from '@/utils/format';

// Operations only: running campaigns in a sideways scroll, each with a progress ring.

type Campaign = HomeDashboard['liveCampaigns'][number];

const TONES = [
  {
    card: 'bg-[#FDEBF0] border-[rgba(249,228,232,0.6)]',
    line: 'border-[rgba(249,228,232,0.8)]',
    ring: '#FF8EAA',
  },
  {
    card: 'bg-[#E2EBE2] border-[rgba(212,226,212,0.6)]',
    line: 'border-[rgba(212,226,212,0.8)]',
    ring: '#8DBA8E',
  },
  {
    card: 'bg-[#E9E1FF] border-[rgba(222,212,255,0.6)]',
    line: 'border-[rgba(222,212,255,0.8)]',
    ring: '#A48BFF',
  },
] as const;

const RING_SIZE = 48;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2 - 1.5;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withDelay(250, withTiming(percent / 100, { duration: 900 })));
  }, [percent, progress]);

  const arc = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - progress.get()) }));

  return (
    <View className="h-12 w-12 items-center justify-center">
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          fill="none"
          animatedProps={arc}
        />
      </Svg>
      <Text className="font-inter-bold text-[11px] leading-4 text-charcoal">{percent}%</Text>
    </View>
  );
}

function Detail({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="w-[125px] gap-0.5">
      <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[0.5px] text-charcoal/60">
        {label}
      </Text>
      <Text
        className={
          strong
            ? 'font-inter-bold text-sm leading-[21px] text-charcoal'
            : 'font-inter-semibold text-xs leading-[18px] text-charcoal/80'
        }
      >
        {value}
      </Text>
    </View>
  );
}

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const tone = TONES[index % TONES.length] ?? TONES[0];
  const press = usePressScale();

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        // TODO(campaigns): open the campaign once that screen exists.
        onPress={() => comingSoon('Campaign details')}
        accessibilityRole="button"
        accessibilityLabel={`${campaign.title} for ${campaign.brand}, ${campaign.stage}, ${campaign.progress}% done`}
        className={`w-[280px] gap-4 overflow-hidden rounded-[28px] border p-5 ${tone.card}`}
        style={{ boxShadow: CARD_SHADOW }}
      >
        <View
          pointerEvents="none"
          className="absolute right-px top-px h-24 w-24 rounded-full bg-white/40"
          style={GLOW}
        />
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-[5px]">
            <View className="flex-row items-center gap-2">
              <Text className="font-inter-bold text-[11px] uppercase leading-4 tracking-[0.55px] text-charcoal">
                {campaign.brand}
              </Text>
              <View className="rounded-full bg-white/60 px-2 py-0.5">
                <Text className="font-inter-bold text-[9px] uppercase leading-[14px] text-charcoal/80">
                  {campaign.stage}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={2}
              className="font-inter-bold text-lg leading-[22px] text-charcoal"
            >
              {campaign.title}
            </Text>
          </View>
          <ProgressRing percent={campaign.progress} color={tone.ring} />
        </View>
        <View className={`flex-row border-t pt-4 ${tone.line}`}>
          <Detail label="Budget" value={formatInr(campaign.budget)} strong />
          <Detail label="Deadline" value={campaign.deadline} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function LiveCampaigns({ campaigns }: { campaigns: HomeDashboard['liveCampaigns'] }) {
  return (
    <View className="gap-4">
      <SectionHeader title="Live Campaigns" />
      {/* Bleeds past the page padding so cards scroll edge to edge. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerClassName="items-start gap-4 px-5 pb-2"
      >
        {campaigns.map((campaign, index) => (
          <CampaignCard key={campaign.id} campaign={campaign} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}
