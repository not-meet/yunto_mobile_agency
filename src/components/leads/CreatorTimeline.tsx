import {
  CircleCheck,
  CircleDot,
  FileText,
  type LucideIcon,
  MessageCircle,
  SquarePen,
} from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import type { CreatorActivity, CreatorActivityType } from '@/services/leadCreatorsService';
import { formatRelativeTime } from '@/utils/format';

// What's happened with the creator on this lead, newest first, threaded down the left.

const TYPE_STYLES: Record<CreatorActivityType, { icon: LucideIcon; tint: string }> = {
  shortlisted: { icon: CircleCheck, tint: '#E9F6ED' },
  message: { icon: MessageCircle, tint: '#F2EDFF' },
  brief: { icon: FileText, tint: '#FFECF3' },
  added: { icon: SquarePen, tint: '#F7F3EA' },
  UNKNOWN: { icon: CircleDot, tint: '#F4F1EC' },
};

const STAGGER_MS = 60;

function TimelineEntry({
  entry,
  index,
  last,
}: {
  entry: CreatorActivity;
  index: number;
  last: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { icon: Icon, tint } = TYPE_STYLES[entry.type];
  const when = formatRelativeTime(entry.at);

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(300).delay(index * STAGGER_MS)}
      accessible
      accessibilityLabel={`${entry.title}, ${when}${entry.detail ? `. ${entry.detail}` : ''}`}
      className="flex-row items-stretch gap-3"
    >
      <View className="w-8 items-center">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: tint, boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
        >
          <Icon size={12} color="#141311" strokeWidth={1.67} />
        </View>
        {last ? null : <View className="mt-1 w-px flex-1 bg-[rgba(140,138,132,0.2)]" />}
      </View>
      <View className={`flex-1 ${last ? '' : 'pb-2'}`}>
        <View
          className="gap-0.5 rounded-2xl border border-[rgba(232,229,223,0.1)] bg-white/80 p-3"
          style={{ boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.01)' }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <Text
              numberOfLines={1}
              className="shrink font-inter-bold text-xs leading-4 text-[#141311]"
            >
              {entry.title}
            </Text>
            <Text className="font-inter text-[9px] leading-[14px] text-[#8C8A84]">{when}</Text>
          </View>
          {entry.detail ? (
            <Text className="font-inter text-[10px] leading-[15px] text-[#8C8A84]">
              {entry.detail}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

export function CreatorTimeline({ activity }: { activity: CreatorActivity[] }) {
  return (
    <View className="gap-3">
      <Text
        accessibilityRole="header"
        className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
      >
        Activity Timeline
      </Text>
      {activity.length === 0 ? (
        <Text className="py-2 font-inter-medium text-sm leading-5 text-muted">
          No activity yet.
        </Text>
      ) : (
        <View>
          {activity.map((entry, i) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              index={i}
              last={i === activity.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}
