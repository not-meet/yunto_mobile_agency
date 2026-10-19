import {
  Lightbulb,
  Link2,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { Pressable, Share, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { SUGGESTION_LABELS } from '@/components/creators/labels';
import { ProfilePanel } from '@/components/creators/ProfilePanel';
import { callNumber, openWhatsApp } from '@/components/leads/contact';
import type { CreatorDetails } from '@/services/creatorsService';
import { formatCount } from '@/utils/format';
import { showToast } from '@/utils/notifications';

// Top of a creator's profile: photo, name and handle with WhatsApp and Call, their niche,
// categories and city, how they compare and what to do with their rate, their public link, and
// their reach and rating at a glance (two by two, as on the web profile).

const SHADOW = '0px 4px 14px rgba(0, 0, 0, 0.1)';

// Categories take these in turn.
const CATEGORY_TONES = [
  { background: 'rgba(230, 225, 249, 0.7)', border: 'rgba(160, 150, 230, 0.25)', text: '#5560CC' },
  { background: 'rgba(255, 215, 235, 0.6)', border: 'rgba(220, 150, 180, 0.25)', text: '#CC5580' },
];

function Pill({
  label,
  icon: Icon,
  background,
  border,
  color,
}: {
  label: string;
  icon?: LucideIcon;
  background: string;
  border: string;
  color: string;
}) {
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
      style={{ backgroundColor: background, borderColor: border }}
    >
      {Icon ? <Icon size={11} color={color} strokeWidth={1.75} /> : null}
      <Text className="font-inter-bold text-[11px] leading-4" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function ContactButton({
  label,
  icon: Icon,
  color,
  rgb,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  rgb: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-8 flex-row items-center gap-1.5 rounded-full border px-3 active:opacity-70"
      style={{ backgroundColor: `rgba(${rgb}, 0.09)`, borderColor: `rgba(${rgb}, 0.22)` }}
    >
      <Icon size={12} color={color} strokeWidth={1.75} />
      <Text className="font-inter-semibold text-xs leading-[18px]" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ProfileCard({ creator }: { creator: CreatorDetails }) {
  const above = creator.vsAverage >= 0;
  const link = creator.profileUrl.replace(/^https:\/\//, '');
  const stats = [
    [
      { label: 'Followers', value: formatCount(creator.followers) },
      { label: 'Eng. Rate', value: `${creator.engagementRate}%` },
    ],
    [
      { label: 'Rating', value: creator.rating === null ? '–' : `${creator.rating} Stars` },
      { label: 'Avg. Views', value: formatCount(creator.avgViews) },
    ],
  ];

  const shareLink = () =>
    Share.share({ message: `${creator.name} (${creator.handle})\n${creator.profileUrl}` }).catch(
      () => showToast('Couldn’t open the share sheet'),
    );

  return (
    <ProfilePanel glow="215, 205, 255">
      <View className="gap-3 px-5 pb-4 pt-5">
        <View className="flex-row items-start gap-4">
          <View>
            <View className="rounded-[20px]" style={{ boxShadow: SHADOW }}>
              <Avatar name={creator.name} url={creator.avatarUrl} size={72} square />
            </View>
            {creator.rosterStatus === 'active' ? (
              <View
                accessibilityLabel="Active"
                className="absolute -bottom-1.5 -right-1.5 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#3E7D52]"
              >
                <View className="h-2 w-2 rounded-full bg-white" />
              </View>
            ) : null}
          </View>
          <View className="flex-1 gap-px">
            <Text
              numberOfLines={1}
              className="font-inter-semibold text-xl leading-[25px] tracking-[-0.5px] text-[#111111]"
            >
              {creator.name}
            </Text>
            <Text
              numberOfLines={1}
              className="font-inter-medium text-[13px] leading-5 text-black/40"
            >
              {creator.handle}
            </Text>
            <View className="flex-row flex-wrap gap-2 pt-[11px]">
              <ContactButton
                label="WhatsApp"
                icon={MessageCircle}
                color="#3E7D52"
                rgb="62, 125, 82"
                onPress={() => openWhatsApp(creator.phone, creator.name)}
              />
              <ContactButton
                label="Call"
                icon={Phone}
                color="#3A5C7E"
                rgb="58, 92, 126"
                onPress={() => callNumber(creator.phone, creator.name)}
              />
            </View>
          </View>
        </View>

        {creator.categories.length > 0 || creator.location ? (
          <View className="flex-row flex-wrap gap-2 pt-1">
            {creator.categories.map((category, i) => {
              const tone = CATEGORY_TONES[i % CATEGORY_TONES.length] ?? CATEGORY_TONES[0]!;
              return (
                <Pill
                  key={category}
                  label={category}
                  background={tone.background}
                  border={tone.border}
                  color={tone.text}
                />
              );
            })}
            {creator.location ? (
              <Pill
                label={creator.location}
                icon={MapPin}
                background="rgba(240, 245, 250, 0.9)"
                border="rgba(58, 92, 126, 0.18)"
                color="#3A5C7E"
              />
            ) : null}
          </View>
        ) : null}

        <View className="items-start gap-2">
          <Pill
            label={`${above ? '+' : ''}${creator.vsAverage}% ${above ? 'Above' : 'Below'} Average`}
            icon={above ? TrendingUp : TrendingDown}
            background="rgba(255, 240, 235, 0.8)"
            border="rgba(230, 140, 100, 0.25)"
            color="#E05C28"
          />
          <Pill
            label={`Suggestion: ${SUGGESTION_LABELS[creator.rateSuggestion]}`}
            icon={Lightbulb}
            background="rgba(240, 235, 255, 0.8)"
            border="rgba(140, 130, 220, 0.25)"
            color="#5560CC"
          />
        </View>

        <View
          className="flex-row items-center gap-3 rounded-[18px] border border-white/90 bg-white/55 px-4 pb-3 pt-4"
          style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)' }}
        >
          <Link2 size={14} color="#AAAAAA" strokeWidth={2} />
          <Text
            numberOfLines={1}
            className="flex-1 font-inter-semibold text-[13px] leading-5 text-[#555555]"
          >
            {link}
          </Text>
          {/* No clipboard module in the app yet; the share sheet offers Copy on Android. */}
          <Pressable
            onPress={shareLink}
            accessibilityRole="button"
            accessibilityLabel="Share profile link"
            className="h-[27px] flex-row items-center gap-1.5 rounded-full border border-[rgba(58,92,126,0.2)] bg-[rgba(58,92,126,0.08)] px-2.5 active:opacity-70"
          >
            <Share2 size={13} color="#3A5C7E" strokeWidth={1.75} />
            <Text className="font-inter-bold text-[11px] leading-4 text-[#3A5C7E]">Share</Text>
          </Pressable>
        </View>
      </View>

      <View className="mx-4 rounded-[18px] border border-black/5 bg-[rgba(240,245,250,0.7)]">
        {stats.map((row, r) => (
          <View key={r} className={`flex-row ${r > 0 ? 'border-t border-black/5' : ''}`}>
            {row.map((stat, i) => (
              <View
                key={stat.label}
                accessible
                accessibilityLabel={`${stat.label}, ${stat.value}`}
                className={`flex-1 items-center gap-1 py-3 ${i > 0 ? 'border-l border-black/5' : ''}`}
              >
                <Text className="font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#AAAAAA]">
                  {stat.label}
                </Text>
                <Text className="font-inter-semibold text-lg leading-[27px] tracking-[-0.45px] text-[#111111]">
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <View className="h-4" />
    </ProfilePanel>
  );
}
