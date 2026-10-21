import {
  BadgeCheck,
  Bell,
  CalendarClock,
  CircleCheck,
  CircleDot,
  type LucideIcon,
  Gauge,
  Phone,
} from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import type { Activity, ActivityType } from '@/services/leadActivityService';
import { dayLabel, timeLabel, toDateKey } from '@/utils/dates';

// What happened on the lead, grouped by day (latest day first, earliest entry first within a
// day), threaded on a line down the left. Entries drift in one after another; a newly added
// one fades in while the rest glide to make room.

const TYPE_STYLES: Record<
  ActivityType,
  { icon: LucideIcon; color: string; tint: string; border: string }
> = {
  reminder: { icon: Bell, color: '#D81B60', tint: '#FFE4E8', border: 'rgba(255, 228, 232, 0.9)' },
  'follow-up': {
    icon: CalendarClock,
    color: '#E65100',
    tint: '#FFEAC4',
    border: 'rgba(255, 234, 196, 0.9)',
  },
  call: { icon: Phone, color: '#3949AB', tint: '#E8EAF6', border: 'rgba(232, 234, 246, 0.9)' },
  contacted: {
    icon: CircleCheck,
    color: '#2E7D32',
    tint: '#E8F5E9',
    border: 'rgba(232, 245, 233, 0.9)',
  },
  converted: {
    icon: BadgeCheck,
    color: '#7C3AED',
    tint: '#EDE4FF',
    border: 'rgba(237, 228, 255, 0.9)',
  },
  intent: { icon: Gauge, color: '#B7791F', tint: '#FDF1DC', border: 'rgba(253, 241, 220, 0.9)' },
  // Any other kind of entry the server sends.
  UNKNOWN: {
    icon: CircleDot,
    color: '#6E6E73',
    tint: '#F2F2F4',
    border: 'rgba(242, 242, 244, 0.9)',
  },
};

const DIVIDER =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.08) 80%, rgba(0, 0, 0, 0) 100%)';

const STAGGER_MS = 60;

interface DayGroup {
  key: string;
  label: string;
  entries: Activity[];
}

function groupByDay(activity: Activity[]): DayGroup[] {
  const sorted = [...activity].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const groups = new Map<string, DayGroup>();
  for (const entry of sorted) {
    const at = new Date(entry.at);
    const key = toDateKey(at);
    const group = groups.get(key) ?? { key, label: dayLabel(at), entries: [] };
    group.entries.push(entry);
    groups.set(key, group);
  }
  return [...groups.values()].reverse();
}

function TimelineEntry({ entry, index }: { entry: Activity; index: number }) {
  const reduceMotion = useReducedMotion();
  const { icon: Icon, color, tint, border } = TYPE_STYLES[entry.type];
  const at = new Date(entry.at);

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(300).delay(index * STAGGER_MS)}
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      accessible
      accessibilityLabel={`${entry.title}, ${dayLabel(at)} ${timeLabel(at)}`}
      className="flex-row items-start gap-4"
    >
      <View className="pt-2.5">
        <View
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: tint }}
        >
          <Icon size={14} color={color} strokeWidth={1.17} />
        </View>
      </View>
      <View
        className="flex-1 gap-1 rounded-xl border bg-white px-4 py-3"
        style={{ borderColor: border }}
      >
        <Text
          numberOfLines={1}
          className="font-inter-semibold text-sm leading-[17px] text-[#1C1C1E]"
        >
          {entry.title}
        </Text>
        <Text className="font-inter-medium text-xs leading-[15px] text-[#6C6C70]">
          {dayLabel(at)} • {timeLabel(at)}
        </Text>
      </View>
    </Animated.View>
  );
}

export function ActivityTimeline({ activity }: { activity: Activity[] }) {
  const reduceMotion = useReducedMotion();
  const groups = groupByDay(activity);
  let index = 0;

  return (
    <View className="pt-6">
      {groups.length === 0 ? (
        <Text className="py-6 text-center font-inter-medium text-[15px] leading-5 text-muted">
          No activity yet.
        </Text>
      ) : (
        <View className="gap-6 pb-6">
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.duration(400)}
            className="absolute bottom-5 left-[11px] top-9 w-0.5"
            style={{ experimental_backgroundImage: DIVIDER }}
          />
          {groups.map((group) => (
            <Animated.View
              key={group.key}
              layout={reduceMotion ? undefined : LinearTransition.duration(250)}
              className="gap-3"
            >
              <Text className="pl-10 font-inter-bold text-xs uppercase leading-[15px] tracking-[0.6px] text-[#6C6C70]">
                {group.label}
              </Text>
              {group.entries.map((entry) => (
                <TimelineEntry key={entry.id} entry={entry} index={index++} />
              ))}
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}
