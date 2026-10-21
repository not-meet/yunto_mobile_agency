import {
  Briefcase,
  Check,
  Eye,
  Lightbulb,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Phone,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/common/Avatar';
import { CREATOR_PLATFORM_STYLES, SUGGESTION_LABELS } from '@/components/creators/labels';
import { callNumber, openWhatsApp } from '@/components/leads/contact';
import { usePressScale } from '@/hooks/usePressScale';
import type { Creator } from '@/services/creatorsService';
import { formatCount } from '@/utils/format';

// One creator on the Creators list, after the web agency card: who they are and where, how they
// compare and what to do with their rate (or, on All Creators, who manages them), their reach and
// value in two rows, and quick View / Call / Chat (`CardButton`, shared with Assign Creators' card).
// The check picks them for sharing.

const SHADOW = '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)';

function Insight({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <View className="h-5 flex-row items-center gap-1 rounded-full border border-white/30 bg-white/70 px-2">
      <Icon size={9} color="#141311" strokeWidth={1.75} />
      <Text numberOfLines={1} className="font-inter-bold text-[9px] leading-[14px] text-[#141311]">
        {label}
      </Text>
    </View>
  );
}

export function CardButton({
  label,
  icon: Icon,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-[31px] flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-white/80 active:opacity-70"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      <Icon size={11} color="#141311" strokeWidth={1.5} />
      <Text className="font-inter-semibold text-[10px] leading-[15px] text-[#141311]">{label}</Text>
    </Pressable>
  );
}

interface CreatorListCardProps {
  creator: Creator;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  // All Creators: who manages them stands in for the rate suggestion.
  showManaged?: boolean;
}

export function CreatorListCard({
  creator,
  selected,
  onToggle,
  onOpen,
  showManaged = false,
}: CreatorListCardProps) {
  const press = usePressScale(0.98);
  const PlatformIcon = CREATOR_PLATFORM_STYLES[creator.platform].icon;
  const above = creator.vsAverage >= 0;

  const managed = showManaged && creator.managedBy !== null;

  // Reach, then value, as on the web card.
  const rows = [
    [
      { label: 'Followers', value: formatCount(creator.followers), color: '#141311' },
      { label: 'Avg. Views', value: formatCount(creator.avgViews), color: '#141311' },
      { label: 'Eng.', value: `${creator.engagementRate}%`, color: '#23C16B' },
    ],
    [
      {
        label: 'Rating',
        value: creator.rating === null ? '–' : `${creator.rating}★`,
        color: '#141311',
      },
      { label: 'CPV', value: creator.cpv === null ? '–' : `${creator.cpv}p`, color: '#141311' },
      { label: 'Match', value: `${creator.matchPct}%`, color: '#5560CC' },
    ],
  ];
  const stats = rows.flat();

  return (
    <Animated.View style={press.style}>
      <Pressable
        {...press.handlers}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${creator.name}, ${creator.handle}, ${creator.niche}, ${stats
          .map((s) => `${s.label} ${s.value}`)
          .join(', ')}`}
        accessibilityHint="Opens the creator's profile"
        className="gap-3.5 rounded-[26px] p-4"
        style={{
          experimental_backgroundImage:
            'linear-gradient(135deg, rgba(242, 237, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
          boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.024)',
        }}
      >
        <View className="flex-row items-start gap-3">
          <View>
            <View className="rounded-full border-2 border-white" style={{ boxShadow: SHADOW }}>
              <Avatar name={creator.name} url={creator.avatarUrl} size={44} />
            </View>
            {PlatformIcon ? (
              <View
                className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full bg-white"
                style={{ boxShadow: SHADOW }}
              >
                <PlatformIcon size={8} color="#141311" />
              </View>
            ) : null}
          </View>

          <View className="flex-1 gap-0.5">
            <Text
              numberOfLines={1}
              className="font-inter-extrabold text-sm leading-[18px] tracking-[-0.35px] text-[#141311]"
            >
              {creator.name}
            </Text>
            <View className="flex-row items-center gap-1.5 pb-0.5">
              <Text
                numberOfLines={1}
                className="shrink font-inter text-[10px] leading-[15px] text-[#8C8A84]"
              >
                {creator.handle}
              </Text>
              <View className="shrink rounded-full border border-white/40 bg-white/80 px-1.5 py-0.5">
                <Text
                  numberOfLines={1}
                  className="font-inter-bold text-[9px] leading-[14px] text-[#8C8A84]"
                >
                  {creator.niche}
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-[7px]">
              {creator.location ? <Insight icon={MapPin} label={creator.location} /> : null}
              {managed ? (
                <Insight icon={Briefcase} label={`Managed by ${creator.managedBy}`} />
              ) : (
                <>
                  <Insight
                    icon={above ? TrendingUp : TrendingDown}
                    label={`${above ? '+' : ''}${creator.vsAverage}% ${above ? 'Above' : 'Below'} Average`}
                  />
                  <Insight
                    icon={Lightbulb}
                    label={`Suggestion: ${SUGGESTION_LABELS[creator.rateSuggestion]}`}
                  />
                </>
              )}
            </View>
          </View>

          <Pressable
            onPress={onToggle}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`Select ${creator.name}`}
            className={`mt-0.5 h-6 w-6 items-center justify-center rounded-full active:opacity-70 ${
              selected ? 'bg-[#141311]' : 'border border-[rgba(20,19,17,0.15)] bg-white/80'
            }`}
            style={{ boxShadow: SHADOW }}
          >
            {selected ? <Check size={11} color="#FAF7F2" strokeWidth={2} /> : null}
          </Pressable>
        </View>

        <View className="gap-2 rounded-2xl bg-[rgba(242,237,255,0.4)] p-2.5">
          {rows.map((row, r) => (
            <View
              key={r}
              className={`flex-row items-center ${
                r > 0 ? 'border-t border-[rgba(20,19,17,0.06)] pt-2' : ''
              }`}
            >
              {row.map((stat, i) => (
                <Fragment key={stat.label}>
                  {i > 0 ? <View className="h-6 w-px bg-[rgba(20,19,17,0.06)]" /> : null}
                  <View className="flex-1 items-center">
                    <Text className="font-inter text-[9px] uppercase leading-[14px] tracking-[0.45px] text-[#8C8A84]">
                      {stat.label}
                    </Text>
                    <Text
                      className="font-inter-extrabold text-sm leading-5"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </Text>
                  </View>
                </Fragment>
              ))}
            </View>
          ))}
        </View>

        <View className="flex-row gap-2 border-t border-white/30 pt-0.5">
          <CardButton
            label="View"
            icon={Eye}
            onPress={onOpen}
            accessibilityLabel={`View ${creator.name}`}
          />
          <CardButton
            label="Call"
            icon={Phone}
            onPress={() => callNumber(creator.phone, creator.name)}
            accessibilityLabel={`Call ${creator.name}`}
          />
          <CardButton
            label="Chat"
            icon={MessageCircle}
            onPress={() => openWhatsApp(creator.phone, creator.name)}
            accessibilityLabel={`WhatsApp ${creator.name}`}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}
