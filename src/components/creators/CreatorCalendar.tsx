import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { BRAND_TAG, CALENDAR_TAGS } from '@/components/creators/labels';
import type { CalendarPost } from '@/services/creatorCalendarService';
import { daysFromToday, longDate, monthGrid, toDateKey } from '@/utils/dates';

// A creator's month, as in yunto_mobile_app's content calendar: what's planned on each day as
// small platform tags (brand collabs in green, posted ones faded). Two tags fit a day; the rest
// are counted. Today is ringed, with a quick add when it's empty and the calendar can be edited;
// the selected day is lifted out in white.

const MAX_TAGS = 2;
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL_SHADOW = 'inset 0px 1px 2px 1px rgba(255, 255, 255, 0.5)';

function DayTag({ post }: { post: CalendarPost }) {
  const tag = CALENDAR_TAGS[post.platform];
  return (
    <View
      className={`h-4 flex-row items-center overflow-hidden rounded-[5px] px-1 ${
        post.status === 'posted' ? 'opacity-50' : ''
      }`}
      style={{ experimental_backgroundImage: post.brand ? BRAND_TAG.gradient : tag.gradient }}
    >
      <Text
        numberOfLines={1}
        className="font-inter-semibold text-[9px] leading-[11px] tracking-[0.2px] text-white"
      >
        {tag.short}
      </Text>
    </View>
  );
}

interface DayCellProps {
  date: Date;
  posts: CalendarPost[];
  selected: boolean;
  canAdd: boolean;
  onPress: () => void;
  onAdd: () => void;
}

function DayCell({ date, posts, selected, canAdd, onPress, onAdd }: DayCellProps) {
  const today = daysFromToday(date) === 0;
  const extra = posts.length - MAX_TAGS;
  const summary = posts.length === 0 ? 'nothing planned' : `${posts.length} planned`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${longDate(date)}${today ? ', today' : ''}, ${summary}`}
      accessibilityState={{ selected }}
      className={`min-h-[68px] flex-1 gap-1 rounded-[14px] border px-1 pb-1.5 pt-1.5 active:opacity-80 ${
        selected ? 'border-[rgba(20,19,17,0.35)] bg-white' : 'border-white/80 bg-white/40'
      }`}
      style={{
        boxShadow: selected
          ? '0px 6px 16px rgba(20, 19, 17, 0.08), inset 0px 2px 4px 1px rgba(255, 255, 255, 0.8)'
          : CELL_SHADOW,
      }}
    >
      <View
        className={`h-[22px] w-[22px] items-center justify-center rounded-full ${
          selected ? 'bg-[#141311]' : today ? 'bg-[rgba(85,96,204,0.15)]' : ''
        }`}
        style={selected ? { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.18)' } : undefined}
      >
        <Text
          className={`text-center text-sm leading-[17px] ${
            selected
              ? 'font-inter-semibold text-white'
              : today
                ? 'font-inter-bold text-periwinkle'
                : 'font-inter-medium text-[#141311]'
          }`}
        >
          {date.getDate()}
        </Text>
      </View>

      <View className="gap-[3px]">
        {posts.slice(0, MAX_TAGS).map((post) => (
          <DayTag key={post.id} post={post} />
        ))}
        {extra > 0 ? (
          <View className="mt-px h-[15px] items-center justify-center rounded-[5px] bg-black/[0.04]">
            <Text className="font-inter-semibold text-[9px] leading-[11px] text-[#5C5C60]">
              +{extra}
            </Text>
          </View>
        ) : null}
      </View>

      {today && canAdd && posts.length === 0 ? (
        <Pressable
          onPress={onAdd}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add content for today"
          className="absolute bottom-1.5 right-1.5 h-5 w-5 items-center justify-center rounded-full bg-black/[0.04] active:opacity-70"
        >
          <Plus size={12} color="#5C5C60" strokeWidth={1} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

interface CreatorCalendarProps {
  month: Date;
  // Keyed by "YYYY-MM-DD", already filtered.
  postsByDay: Map<string, CalendarPost[]>;
  selected: string | null;
  loading: boolean;
  canAdd: boolean;
  onSelectDay: (date: string) => void;
  onAddToday: () => void;
}

export function CreatorCalendar({
  month,
  postsByDay,
  selected,
  loading,
  canAdd,
  onSelectDay,
  onAddToday,
}: CreatorCalendarProps) {
  return (
    // Dimmed while the month loads.
    <View
      accessibilityState={{ busy: loading }}
      className={`rounded-[28px] border border-white/70 bg-white/55 px-3.5 pb-6 pt-5 ${loading ? 'opacity-60' : ''}`}
      style={{
        boxShadow:
          '0px 16px 40px rgba(0, 0, 0, 0.03), inset 0px 2px 8px 1px rgba(255, 255, 255, 0.6)',
      }}
    >
      <View className="flex-row pb-4">
        {WEEKDAY_INITIALS.map((day, i) => (
          <Text
            key={i}
            className="flex-1 text-center font-inter-semibold text-[13px] uppercase leading-4 tracking-[0.5px] text-[#5C5C60]"
          >
            {day}
          </Text>
        ))}
      </View>

      <View className="gap-1.5">
        {monthGrid(month).map((week, row) => (
          <View key={row} className="flex-row gap-1.5">
            {week.map((date, col) => {
              if (!date) return <View key={col} className="min-h-[68px] flex-1" />;
              const key = toDateKey(date);
              return (
                <DayCell
                  key={col}
                  date={date}
                  posts={postsByDay.get(key) ?? []}
                  selected={key === selected}
                  canAdd={canAdd}
                  onPress={() => onSelectDay(key)}
                  onAdd={onAddToday}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
