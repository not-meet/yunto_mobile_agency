import { Eye, type LucideIcon, Radio, TrendingUp, Users } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { signed, trendColor } from '@/components/leads/labels';
import type { LeadCreatorDetails } from '@/services/leadCreatorsService';
import { formatCount } from '@/utils/format';

// A creator's numbers, two by two: followers, average views, engagement and this campaign's
// reach, each with how it's moving where that's known.

const MUTED = '#8C8A84';
const EMPTY = '—';

interface Tile {
  label: string;
  icon: LucideIcon;
  background: string;
  value: string;
  foot: { text: string; color: string };
}

function AnalyticsTile({ label, icon: Icon, background, value, foot }: Tile) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${value}, ${foot.text}`}
      className="flex-1 gap-1.5 rounded-[20px] p-3.5"
      style={{ backgroundColor: background, boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)' }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-inter text-[9px] uppercase leading-[14px] tracking-[0.45px] text-[#8C8A84]">
          {label}
        </Text>
        <View className="h-5 w-5 items-center justify-center rounded-full bg-white/70">
          <Icon size={9} color="#141311" strokeWidth={1.75} />
        </View>
      </View>
      <Text className="font-inter-extrabold text-xl leading-7 tracking-[-0.5px] text-[#141311]">
        {value}
      </Text>
      <Text
        numberOfLines={1}
        className="font-inter-semibold text-[9px] leading-[14px]"
        style={{ color: foot.color }}
      >
        {foot.text}
      </Text>
    </View>
  );
}

export function CreatorAnalytics({ creator }: { creator: LeadCreatorDetails }) {
  const { followersGrowth, engagementChange, campaignReach } = creator.analytics;

  const tiles: Tile[] = [
    {
      label: 'Followers',
      icon: Users,
      background: '#E9F6ED',
      value: formatCount(creator.followers),
      foot:
        followersGrowth === null
          ? { text: 'No change this month', color: MUTED }
          : { text: `${signed(followersGrowth)} this month`, color: trendColor(followersGrowth) },
    },
    {
      label: 'Avg views',
      icon: Eye,
      background: '#F2EDFF',
      value: formatCount(creator.avgViews),
      foot: {
        text: creator.platform === 'youtube' ? 'per video avg' : 'per reel avg',
        color: MUTED,
      },
    },
    {
      label: 'Engagement',
      icon: TrendingUp,
      background: '#FFECF3',
      value: `${creator.engagementRate}%`,
      foot:
        engagementChange === null
          ? { text: 'No past campaign', color: MUTED }
          : { text: `${signed(engagementChange)} vs last`, color: trendColor(engagementChange) },
    },
    {
      label: 'Est. reach',
      icon: Radio,
      background: '#F7F3EA',
      value: campaignReach === null ? EMPTY : formatCount(campaignReach),
      foot: { text: campaignReach === null ? 'Nothing live yet' : 'this campaign', color: MUTED },
    },
  ];

  return (
    <View className="gap-3">
      <Text
        accessibilityRole="header"
        className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
      >
        Creator Analytics
      </Text>
      <View className="gap-3">
        {[tiles.slice(0, 2), tiles.slice(2)].map((row, i) => (
          <View key={i} className="flex-row gap-3">
            {row.map((tile) => (
              <AnalyticsTile key={tile.label} {...tile} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
