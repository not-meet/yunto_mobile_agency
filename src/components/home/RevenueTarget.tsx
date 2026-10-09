import { IndianRupee, Target, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { RevenueTargetSheet } from '@/components/home/RevenueTargetSheet';
import { CARD_SHADOW } from '@/components/home/shared';
import { usePressScale } from '@/hooks/usePressScale';
import type { Revenue, TargetFrequency } from '@/services/homeService';
import { formatInr } from '@/utils/format';

// Admin and sales: revenue so far against the target, which "Set Target" changes.

const PERIOD: Record<TargetFrequency, { label: string; previous: string }> = {
  weekly: { label: 'Weekly', previous: 'vs last week' },
  monthly: { label: 'Monthly', previous: 'vs last month' },
  quarterly: { label: 'Quarterly', previous: 'vs last quarter' },
};

function ProgressBar({ percent }: { percent: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.set(withTiming(percent, { duration: 900 }));
  }, [percent, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.get()}%` }));

  return (
    <View
      className="h-2.5 justify-center rounded-full bg-white/50 p-px"
      style={{ boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.05)' }}
    >
      <Animated.View
        className="h-2 items-end justify-center rounded-full bg-charcoal pr-1"
        style={fill}
      >
        <View className="h-1 w-1 rounded-full bg-white/40" />
      </Animated.View>
    </View>
  );
}

export function RevenueTarget({ revenue }: { revenue: Revenue }) {
  const [editing, setEditing] = useState(false);
  const press = usePressScale(0.94);
  const period = PERIOD[revenue.frequency];
  const percent =
    revenue.target > 0 ? Math.min(100, Math.round((revenue.achieved / revenue.target) * 100)) : 0;
  const change = `${revenue.changePercent >= 0 ? '+' : ''}${revenue.changePercent}%`;

  return (
    <View
      className="gap-5 overflow-hidden rounded-[32px] border border-[rgba(230,225,249,0.5)] bg-[#F2EFF6] p-6"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <View
        pointerEvents="none"
        className="absolute -bottom-[38px] -left-[39px] h-48 w-48 rounded-full bg-white/50"
        style={{ filter: 'blur(20px)' }}
      />

      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <View
            className="h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/50"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <IndianRupee size={14} color="#1E1E1E" strokeWidth={1.17} />
          </View>
          <Text className="font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-charcoal/60">
            {period.label} Revenue
          </Text>
        </View>
        <Text className="pb-1 font-inter-bold text-[44px] leading-[44px] tracking-[-1.1px] text-charcoal">
          {formatInr(revenue.achieved)}
        </Text>
        <View
          className="flex-row items-center gap-1.5 self-start rounded-full border border-white/50 bg-white/80 px-3 py-1.5"
          style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}
        >
          <View className="h-5 w-5 items-center justify-center rounded-full bg-[#BEE3B0]">
            <TrendingUp size={12} color="#1E1E1E" strokeWidth={1} />
          </View>
          <Text className="font-inter-bold text-[13px] leading-5 text-charcoal">{change}</Text>
          <View className="ml-0.5 border-l border-[rgba(232,226,217,0.4)] pl-2">
            <Text className="font-inter-semibold text-[10px] leading-[15px] text-charcoal/50">
              {period.previous}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="gap-2 rounded-[20px] border border-white/50 bg-white/40 p-4"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <View className="flex-row items-end justify-between pb-1">
          <View className="gap-1">
            <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[1px] text-charcoal/50">
              Target Progress
            </Text>
            <Text className="font-inter-bold text-sm leading-[21px] tracking-[-0.35px] text-charcoal/40">
              {formatInr(revenue.achieved)} / {formatInr(revenue.target)}
            </Text>
          </View>
          <Animated.View style={press.style}>
            <Pressable
              {...press.handlers}
              onPress={() => setEditing(true)}
              accessibilityRole="button"
              accessibilityLabel="Set revenue target"
              className="flex-row items-center gap-1 rounded-full border border-white bg-white px-3 py-1.5"
              style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' }}
            >
              <Target size={10} color="#1E1E1E" strokeWidth={1.5} />
              <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[0.5px] text-charcoal">
                Set Target
              </Text>
            </Pressable>
          </Animated.View>
        </View>
        <ProgressBar percent={percent} />
        <View className="flex-row justify-between px-1">
          <Text className="font-inter-bold text-[9px] uppercase leading-[14px] tracking-[0.9px] text-charcoal/40">
            {percent}% achieved
          </Text>
          <Text className="font-inter-bold text-[9px] uppercase leading-[14px] tracking-[0.9px] text-charcoal/40">
            {revenue.daysLeft} days left
          </Text>
        </View>
      </View>

      <RevenueTargetSheet visible={editing} revenue={revenue} onClose={() => setEditing(false)} />
    </View>
  );
}
