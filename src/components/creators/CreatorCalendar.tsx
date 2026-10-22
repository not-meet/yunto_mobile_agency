import { Briefcase } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { BRAND_TAG, CALENDAR_TAGS, CREATOR_PLATFORM_STYLES } from '@/components/creators/labels';
import type { CalendarPost } from '@/services/creatorCalendarService';
import { daysFromToday, longDate, monthGrid, toDateKey } from '@/utils/dates';

// A creator's month, as in yunto_mobile_app's planner calendar: what's planned on each day as
// small platform tags (brand collabs in green, posted ones faded). Two tags fit a day; the rest
// are counted. Today is ringed in lavender and the selected day's date sits in a purple circle.
// When the calendar can be edited, today and later days carry a "+ Add" pill that opens the
// editor.

const MAX_TAGS = 2;
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL_SHADOW = 'inset 0px 1px 2px 1px rgba(255, 255, 255, 0.5)';

function DayTag({ post }: { post: CalendarPost }) {
  const tag = CALENDAR_TAGS[post.platform];
  const PlatformIcon = CREATOR_PLATFORM_STYLES[post.platform].icon;
  return (
    <View
      className={`h-4 flex-row items-center gap-[3px] overflow-hidden rounded-[5px] px-1 ${
        post.status === 'posted' ? 'opacity-50' : ''
      }`}
      style={{ experimental_backgroundImage: post.brand ? BRAND_TAG.gradient : tag.gradient }}
    >
      {post.brand ? (
        <Briefcase size={10} color="#FFFFFF" strokeWidth={0.83} />
      ) : PlatformIcon ? (
        <PlatformIcon size={10} color="#FFFFFF" />
      ) : null}
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
  const fromToday = daysFromToday(date);
  const today = fromToday === 0;
  const extra = posts.length - MAX_TAGS;
  const summary = posts.length === 0 ? 'nothing planned' : `${posts.length} planned`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${longDate(date)}${today ? ', today' : ''}, ${summary}`}
      accessibilityState={{ selected }}
      className="min-h-[68px] flex-1 gap-1 rounded-[14px] border border-white/80 bg-white/40 px-1 pb-1.5 pt-1.5 active:opacity-80"
      style={{ boxShadow: CELL_SHADOW }}
    >
      {/* The circle is drawn, not a rounded view: on Android the rounded view's fill kept showing
          as a square here. */}
      <View className="h-[22px] w-[22px] items-center justify-center self-start">
        {selected || today ? (
          <Svg width={22} height={22} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Circle
              cx={11}
              cy={11}
              r={11}
              fill={selected ? '#7C3AED' : 'rgba(124, 58, 237, 0.15)'}
            />
          </Svg>
        ) : null}
        <Text
          className={`text-center text-sm leading-[17px] ${
            selected
              ? 'font-inter-semibold text-white'
              : today
                ? 'font-inter-bold text-[#7C3AED]'
                : 'font-inter-medium text-[#141416]'
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

      {canAdd && fromToday >= 0 ? (
        <Pressable
          onPress={onAdd}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`Add content for ${longDate(date)}`}
          className="mt-auto h-[15px] items-center justify-center rounded-[5px] bg-[rgba(124,58,237,0.1)] active:opacity-70"
        >
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-[9px] leading-[11px] text-[#7C3AED]"
          >
            + Add
          </Text>
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
  // Today or a later day, "YYYY-MM-DD".
  onAdd: (date: string) => void;
}

export function CreatorCalendar({
  month,
  postsByDay,
  selected,
  loading,
  canAdd,
  onSelectDay,
  onAdd,
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
                  onAdd={() => onAdd(key)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
