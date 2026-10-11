import {
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

import { CREATOR_PLATFORM_STYLES } from '@/components/creators/labels';
import { ProfilePanel } from '@/components/creators/ProfilePanel';
import type { Commercials } from '@/services/creatorsService';
import { groupDigits } from '@/utils/format';
import { showToast } from '@/utils/notifications';

// A creator's rates per platform: what a reel, story and post cost. Each platform folds open
// from its header.

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

function PlatformRates({ rates, first }: { rates: Commercials; first: boolean }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(first);
  const style = CREATOR_PLATFORM_STYLES[rates.platform];
  const Icon = style.icon;
  const offered = CONTENT.filter((c) => rates[c.key] !== null);

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
          {offered.map(({ key, label, icon: RowIcon, color, background }) => (
            <View
              key={key}
              accessible
              accessibilityLabel={`${label}, ₹${groupDigits(rates[key] ?? 0)}`}
              className="flex-row items-center justify-between border-b border-black/5 py-3.5"
            >
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
              <Text className="font-inter-semibold text-sm leading-[21px] text-[#111111]">
                ₹{groupDigits(rates[key] ?? 0)}
              </Text>
            </View>
          ))}
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
