import { CalendarDays, Clock } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { GLASS_SHADOW, PRIORITY_STYLES, timeLabel } from '@/components/reminders/labels';
import type { Reminder } from '@/services/reminderService';
import { dayLabel, fromDateKey } from '@/utils/dates';

// One reminder: its time, priority and day, then the title and details.

const SHEEN =
  'linear-gradient(120.16deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)';

export function ReminderCard({ reminder }: { reminder: Reminder }) {
  const priority = PRIORITY_STYLES[reminder.priority];
  const day = dayLabel(fromDateKey(reminder.dueDate));
  const time = reminder.dueTime ? timeLabel(reminder.dueTime) : null;

  return (
    <View
      accessible
      accessibilityLabel={`${reminder.title}, ${priority.label} priority, ${day}${time ? ` at ${time}` : ''}`}
      className="gap-4 overflow-hidden rounded-[32px] border border-white/80 bg-white/55 p-6"
      style={{ boxShadow: GLASS_SHADOW }}
    >
      <View
        pointerEvents="none"
        className="absolute inset-px rounded-[32px]"
        style={{ experimental_backgroundImage: SHEEN }}
      />

      <View className="flex-row flex-wrap items-center gap-2">
        {time ? (
          <View
            className="h-[30px] flex-row items-center gap-1 rounded-2xl border border-white/80 bg-white/70 px-3"
            style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.02)' }}
          >
            <Clock size={14} color="#4A3A6B" strokeWidth={1.17} />
            <Text className="font-inter-bold text-[13px] leading-4 text-[#4A3A6B]">{time}</Text>
          </View>
        ) : null}
        <View
          className="h-[29px] justify-center rounded-2xl border border-white/60 px-3"
          style={{ experimental_backgroundImage: priority.gradient, boxShadow: priority.shadow }}
        >
          <Text
            className="font-inter-bold text-xs uppercase leading-[15px] tracking-[0.5px]"
            style={{ color: priority.color }}
          >
            {priority.label}
          </Text>
        </View>
        <View className="h-[29px] flex-row items-center gap-1 rounded-2xl border border-white/70 bg-[rgba(240,235,250,0.6)] px-3">
          <CalendarDays size={14} color="#7B6D9C" strokeWidth={1.17} />
          <Text className="font-inter-semibold text-xs leading-[15px] text-[#7B6D9C]">{day}</Text>
        </View>
      </View>

      <View className="gap-[5px]">
        <Text className="font-inter-semibold text-xl leading-[26px] tracking-[-0.4px] text-[#1E1A2B]">
          {reminder.title}
        </Text>
        {reminder.details ? (
          <Text className="font-inter-regular text-[15px] leading-[22px] text-[#6B627A]">
            {reminder.details}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
