import {
  ChartColumn,
  ChartColumnDecreasing,
  ChartColumnIncreasing,
  ChevronDown,
  CirclePlay,
  Clapperboard,
  Image as ImageIcon,
  type LucideIcon,
  Pencil,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { CREATOR_PLATFORM_STYLES, SUGGESTION_LABELS } from '@/components/creators/labels';
import { ProfilePanel } from '@/components/creators/ProfilePanel';
import type { Commercials, RateSuggestion } from '@/services/creatorsService';
import { groupDigits } from '@/utils/format';
import { showToast } from '@/utils/notifications';

// A creator's rates per platform: what a reel, story and post cost against the market rate, and
// whether to move them. Each platform folds open from its header.

const CONTENT: {
  key: 'reel' | 'story' | 'post';
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
}[] = [
  { key: 'reel', label: 'Reels', icon: Clapperboard, color: '#6A3A7E', background: '#F5F0FA' },
  { key: 'story', label: 'Story', icon: CirclePlay, color: '#7E5C2A', background: '#FEF9EE' },
  { key: 'post', label: 'Post', icon: ImageIcon, color: '#3E5C45', background: '#F0F5F1' },
];

const SUGGESTION_STYLES: Record<
  RateSuggestion,
  { icon: LucideIcon; color: string; background: string }
> = {
  increase: { icon: ChartColumnIncreasing, color: '#3E7D52', background: 'rgba(62, 125, 82, 0.1)' },
  hold: { icon: ChartColumn, color: '#64748B', background: 'rgba(100, 116, 139, 0.1)' },
  decrease: {
    icon: ChartColumnDecreasing,
    color: '#B7791F',
    background: 'rgba(214, 158, 46, 0.12)',
  },
  UNKNOWN: { icon: ChartColumn, color: '#64748B', background: 'rgba(100, 116, 139, 0.1)' },
};

function RateValue({ label, amount }: { label: string; amount: number | null }) {
  return (
    <View className="flex-1 gap-0.5">
      <Text className="font-inter-medium text-[11px] leading-4 text-black/40">{label}</Text>
      <Text className="font-inter-semibold text-sm leading-[21px] text-[#111111]">
        {amount === null ? '—' : `₹${groupDigits(amount)}`}
      </Text>
    </View>
  );
}

function PlatformRates({ rates, first }: { rates: Commercials; first: boolean }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(first);
  const style = CREATOR_PLATFORM_STYLES[rates.platform];
  const Icon = style.icon;
  const offered = CONTENT.flatMap((c) => {
    const rate = rates[c.key];
    return rate ? [{ ...c, rate }] : [];
  });
  const above = (rates.vsAverage ?? 0) >= 0;

  return (
    <View>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`${style.label} rates`}
        accessibilityState={{ expanded: open }}
        className="flex-row items-center gap-3 border-b border-black/5 py-3.5 active:opacity-80"
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(230, 215, 245, 0.7)' }}
        >
          {Icon ? <Icon size={15} color={style.color} /> : null}
        </View>
        <Text className="flex-1 font-inter-semibold text-sm leading-[21px] text-[#111111]">
          {style.label}
        </Text>
        {rates.vsAverage !== null ? (
          <Text
            className="font-inter-semibold text-[11px] leading-4"
            style={{ color: above ? '#3E7D52' : '#B7791F' }}
          >
            {above ? '+' : ''}
            {rates.vsAverage}% {above ? 'above' : 'below'} avg
          </Text>
        ) : null}
        <Animated.View
          style={{
            transform: [{ rotate: open ? '180deg' : '0deg' }],
            ...(reduceMotion ? null : { transitionProperty: 'transform', transitionDuration: 200 }),
          }}
        >
          <ChevronDown size={15} color="#BBBBBB" strokeWidth={2} />
        </Animated.View>
      </Pressable>
      {open ? (
        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)}>
          <Text className="pt-2.5 font-inter-medium text-[11px] leading-4 text-black/40">
            All rates are (tax inc.)
          </Text>
          {offered.map(({ key, label, icon: RowIcon, color, background, rate }) => {
            const suggestion = SUGGESTION_STYLES[rate.suggestion];
            const SuggestionIcon = suggestion.icon;
            return (
              <View
                key={key}
                accessible
                accessibilityLabel={`${label}, creator rate ₹${groupDigits(rate.creatorRate)}${
                  rate.marketRate === null ? '' : `, market rate ₹${groupDigits(rate.marketRate)}`
                }, suggestion: ${SUGGESTION_LABELS[rate.suggestion]}`}
                className="gap-2.5 border-b border-black/5 py-3.5"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: background }}
                    >
                      <RowIcon size={12} color={color} strokeWidth={1.75} />
                    </View>
                    <Text className="font-inter-semibold text-[13px] leading-5 text-[#333333]">
                      {label}
                    </Text>
                  </View>
                  {rate.suggestion !== 'UNKNOWN' ? (
                    <View
                      className="flex-row items-center gap-1 rounded-full px-2 py-1"
                      style={{ backgroundColor: suggestion.background }}
                    >
                      <SuggestionIcon size={11} color={suggestion.color} strokeWidth={2} />
                      <Text
                        className="font-inter-semibold text-[11px] leading-4"
                        style={{ color: suggestion.color }}
                      >
                        {SUGGESTION_LABELS[rate.suggestion]}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View className="flex-row gap-3 pl-10">
                  <RateValue label="Creator Rate" amount={rate.creatorRate} />
                  <RateValue label="Market Rate" amount={rate.marketRate} />
                </View>
              </View>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

export function CommercialsCard({ commercials }: { commercials: Commercials[] }) {
  return (
    <ProfilePanel glow="205, 220, 255">
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-[15px] leading-[22px] tracking-[-0.375px] text-[#111111]"
        >
          Commercials
        </Text>
        {/* TODO(creators): edit rates once the API takes rate updates. */}
        <Pressable
          onPress={() => showToast('Editing rates is coming soon')}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Edit rates"
          className="h-8 w-8 items-center justify-center rounded-full border border-black/[0.06] bg-black/[0.04] active:opacity-70"
        >
          <Pencil size={13} color="#555555" strokeWidth={2} />
        </Pressable>
      </View>
      <View className="px-5 pb-4">
        {commercials.length > 0 ? (
          commercials.map((rates, i) => (
            <PlatformRates key={rates.platform} rates={rates} first={i === 0} />
          ))
        ) : (
          <Text className="pb-2 font-inter-medium text-[13px] leading-5 text-black/40">
            No rates added yet.
          </Text>
        )}
      </View>
    </ProfilePanel>
  );
}
