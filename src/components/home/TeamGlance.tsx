import { router } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CARD_SHADOW } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';
import { teamPeriodSchema, type HomeDashboard, type TeamPeriod } from '@/services/homeService';

// Admin only: who's in today per team, and each team's workload for the picked period.

const PERIODS = teamPeriodSchema.options;
const SEGMENT_WIDTH = 32;
const SEGMENT_GAP = 4;
const GROUP_TONES = ['bg-[rgba(224,231,255,0.3)]', 'bg-[rgba(209,250,229,0.2)]'];

function PeriodPicker({
  value,
  onChange,
}: {
  value: TeamPeriod;
  onChange: (p: TeamPeriod) => void;
}) {
  const offset = useSharedValue(PERIODS.indexOf(value));

  useEffect(() => {
    offset.set(withSpring(PERIODS.indexOf(value), { damping: 18, stiffness: 220 }));
  }, [value, offset]);

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.get() * (SEGMENT_WIDTH + SEGMENT_GAP) }],
  }));

  return (
    <View className="flex-row gap-1 rounded-full border border-white/70 bg-white/60 px-1 py-0.5">
      <Animated.View
        className="absolute left-1 top-0.5 h-6 rounded-full bg-cocoa"
        style={[indicator, { width: SEGMENT_WIDTH, boxShadow: CARD_SHADOW }]}
      />
      {PERIODS.map((period) => {
        const selected = period === value;
        return (
          <Pressable
            key={period}
            onPress={() => onChange(period)}
            accessibilityRole="tab"
            accessibilityLabel={period}
            accessibilityState={{ selected }}
            className="h-6 items-center justify-center"
            style={{ width: SEGMENT_WIDTH }}
          >
            <Text
              className={`font-inter-semibold text-xs leading-4 ${selected ? 'text-[#F4F6F8]' : 'text-slate'}`}
            >
              {period[0]?.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Legend({ label, active }: { label: string; active: boolean }) {
  return (
    <View
      className={`flex-row items-center gap-1 rounded-full border px-3 py-1 ${active ? 'border-[#7BF1A8] bg-[rgba(240,253,244,0.6)]' : 'border-[#E2E8F0] bg-[rgba(241,245,249,0.4)]'}`}
    >
      <View className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#05DF72]' : 'bg-[#D1D5DC]'}`} />
      <Text
        className={`font-inter-medium text-xs leading-4 ${active ? 'text-[#00A63E]' : 'text-slate'}`}
      >
        {label}
      </Text>
    </View>
  );
}

export function TeamGlance({ team }: { team: HomeDashboard['team'] }) {
  const [period, setPeriod] = useState<TeamPeriod>('day');
  const press = usePressScale(0.9);

  return (
    <View
      className="gap-3 rounded-3xl border border-white/75 bg-white/55 px-5 pb-5 pt-4"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text
            accessibilityRole="header"
            className="font-inter-semibold text-base leading-6 text-ink"
          >
            Team Glance
          </Text>
          <Text className="font-inter text-xs leading-4 text-[#787274]">
            Total Members: {team.total}
          </Text>
        </View>
        <PeriodPicker value={period} onChange={setPeriod} />
      </View>

      <View className="flex-row gap-2">
        <Legend label="Active" active />
        <Legend label="Absent" active={false} />
      </View>

      {team.groups.map((group, index) => (
        <View
          key={group.name}
          className={`gap-2 rounded-3xl border border-white/60 px-4 pb-3 pt-4 ${GROUP_TONES[index % GROUP_TONES.length]}`}
          style={{ boxShadow: CARD_SHADOW }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-inter-semibold text-sm leading-5 text-ink">{group.name}</Text>
              <Text className="font-inter text-xs leading-4 text-slate">
                {group.members} Members
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Text className="font-inter-medium text-xs leading-4 text-[#00A63E]">
                {group.active} Active
              </Text>
              <Text className="font-inter text-xs leading-4 text-slate">{group.absent} Absent</Text>
            </View>
          </View>
          {/* Keyed by period so the chips fade in again when it changes. */}
          <Animated.View
            key={period}
            entering={FadeIn.duration(220)}
            className="flex-row flex-wrap gap-2"
          >
            {group.workload[period].map((chip) => (
              <View key={chip} className="rounded-full border border-white/60 bg-white px-2.5 py-1">
                <Text className="font-inter-medium text-xs leading-4 text-ink">{chip}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      ))}

      <View className="flex-row justify-end">
        <Animated.View style={press.style}>
          <Pressable
            {...press.handlers}
            onPress={() => router.push('/team/people')}
            accessibilityRole="button"
            accessibilityLabel="Open team overview"
            className="h-8 w-8 items-center justify-center rounded-full bg-cocoa"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <ArrowUpRight size={14} color="#F4F6F8" strokeWidth={2} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
