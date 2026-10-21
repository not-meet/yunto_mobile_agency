import { Eye, Mail } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CreatorAvatar } from '@/components/leads/CreatorAvatar';
import { usePressScale } from '@/hooks/usePressScale';
import type { LeadCreator } from '@/services/leadCreatorsService';
import { formatCount } from '@/utils/format';
import { showToast } from '@/utils/notifications';

// One creator pitched for a lead: who they are and their reach. Tap the card (or View) to open
// their details.

function CardButton({
  label,
  icon: Icon,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon: typeof Eye;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-[31px] flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-white/80 active:opacity-70"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      <Icon size={11} color="#141311" strokeWidth={1.5} />
      <Text className="font-inter-semibold text-[10px] leading-[15px] text-[#141311]">{label}</Text>
    </Pressable>
  );
}

interface CreatorCardProps {
  creator: LeadCreator;
  tint: string;
  onOpen: () => void;
}

export function CreatorCard({ creator, tint, onOpen }: CreatorCardProps) {
  const press = usePressScale(0.98);

  const stats = [
    { label: 'Followers', value: formatCount(creator.followers), color: '#141311' },
    { label: 'Avg views', value: formatCount(creator.avgViews), color: '#141311' },
    { label: 'Eng. rate', value: `${creator.engagementRate}%`, color: '#23C16B' },
  ];

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${creator.name}, ${creator.handle}, ${creator.niche}, ${stats
          .map((s) => `${s.label} ${s.value}`)
          .join(', ')}`}
        accessibilityHint="Opens the creator"
        className="gap-3 rounded-3xl p-4"
        style={{ backgroundColor: tint, boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.02)' }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-3">
            <CreatorAvatar
              name={creator.name}
              url={creator.avatarUrl}
              platform={creator.platform}
              size={44}
            />
            <View className="flex-1 gap-0.5">
              <Text
                numberOfLines={1}
                className="font-inter-bold text-sm leading-[18px] tracking-[-0.35px] text-[#141311]"
              >
                {creator.name}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Text
                  numberOfLines={1}
                  className="shrink font-inter text-[10px] leading-[15px] text-[#8C8A84]"
                >
                  {creator.handle}
                </Text>
                <View className="rounded-full bg-white/70 px-1.5 py-0.5">
                  <Text className="font-inter-bold text-[9px] leading-[14px] text-[#8C8A84]">
                    {creator.niche}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2 rounded-[14px] bg-white/50 p-2">
          {stats.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 ? <View className="h-5 w-px bg-[rgba(20,19,17,0.05)]" /> : null}
              <View className="flex-1 items-center">
                <Text className="font-inter text-[9px] uppercase leading-[14px] tracking-[0.45px] text-[#8C8A84]">
                  {stat.label}
                </Text>
                <Text className="font-inter-bold text-xs leading-4" style={{ color: stat.color }}>
                  {stat.value}
                </Text>
              </View>
            </Fragment>
          ))}
        </View>

        <View className="flex-row gap-2 border-t border-white/30 pt-1">
          <CardButton
            label="View"
            icon={Eye}
            onPress={onOpen}
            accessibilityLabel={`View ${creator.name}`}
          />
          {/* TODO(creators): open a chat once creator messaging exists. */}
          <CardButton
            label="Contact"
            icon={Mail}
            onPress={() => showToast('Contacting creators is coming soon')}
            accessibilityLabel={`Contact ${creator.name}`}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}
