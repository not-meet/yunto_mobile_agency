import { Briefcase, Plus, Sparkles, Trash2 } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Button } from '@/components/common/Button';
import {
  BRAND_TAG,
  CONTENT_STATUS_STYLES,
  CONTENT_TYPE_LABELS,
  CREATOR_PLATFORM_STYLES,
} from '@/components/creators/labels';
import type { CalendarPost } from '@/services/creatorCalendarService';
import { daysFromToday, fromDateKey, longDate } from '@/utils/dates';

// Opened by tapping a day on the creator calendar (as in yunto_mobile_app): everything planned
// for it with its platform, kind and status; tapping a piece opens it in the content editor. When
// the calendar can be edited, a piece that isn't posted yet can be taken off, and today or later
// can have something new written.

interface CalendarDaySheetProps {
  // "YYYY-MM-DD", or null when closed.
  date: string | null;
  posts: CalendarPost[];
  canEdit: boolean;
  onClose: () => void;
  onDelete: (post: CalendarPost) => void;
  onAdd: (date: string) => void;
  onOpen: (post: CalendarPost) => void;
}

interface DayPostProps {
  post: CalendarPost;
  onOpen: () => void;
  onDelete: (() => void) | null;
}

function DayPost({ post, onOpen, onDelete }: DayPostProps) {
  const platform = CREATOR_PLATFORM_STYLES[post.platform];
  const status = CONTENT_STATUS_STYLES[post.status];
  const Icon = platform.icon;

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${post.title}, ${platform.label} ${CONTENT_TYPE_LABELS[post.contentType]}, ${status.label}${post.brand ? `, ${post.brand} collab` : ''}${post.ai ? ', AI planned' : ''}`}
      accessibilityHint="Opens it in the editor"
      className="flex-row items-center gap-3 rounded-[20px] bg-[#F8F8F8] p-3 active:opacity-80"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
        {Icon ? <Icon size={18} color={platform.color} /> : null}
      </View>
      <View className="flex-1 gap-1">
        <Text
          numberOfLines={1}
          className="font-inter-semibold text-[15px] leading-[18px] text-cocoa"
        >
          {post.title}
        </Text>
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="font-inter-medium text-[13px] leading-4 text-muted">
            {platform.label} · {CONTENT_TYPE_LABELS[post.contentType]}
          </Text>
          {post.brand ? (
            <View className="flex-row items-center gap-1">
              <Briefcase size={12} color={BRAND_TAG.color} strokeWidth={1.5} />
              <Text
                numberOfLines={1}
                className="font-inter-medium text-[13px] leading-4 text-[#059669]"
              >
                {post.brand}
              </Text>
            </View>
          ) : null}
          {post.ai ? (
            <View className="flex-row items-center gap-1">
              <Sparkles size={12} color="#5560CC" strokeWidth={1.5} />
              <Text className="font-inter-medium text-[13px] leading-4 text-periwinkle">AI</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: status.background }}>
        <Text className="font-inter-bold text-[11px] leading-4" style={{ color: status.color }}>
          {status.label}
        </Text>
      </View>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${post.title}`}
          className="h-8 w-8 items-center justify-center rounded-full bg-white active:opacity-70"
        >
          <Trash2 size={14} color="#E11D48" strokeWidth={1.75} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export function CalendarDaySheet({
  date,
  posts,
  canEdit,
  onClose,
  onDelete,
  onAdd,
  onOpen,
}: CalendarDaySheetProps) {
  const day = date ? fromDateKey(date) : null;
  const upcoming = day ? daysFromToday(day) >= 0 : false;

  return (
    <BottomSheet visible={date !== null} onClose={onClose} title={day ? longDate(day) : ''}>
      <ScrollView
        bounces={false}
        className="mt-5 max-h-[360px] grow-0"
        contentContainerClassName="gap-2.5"
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <DayPost
              key={post.id}
              post={post}
              onOpen={() => onOpen(post)}
              onDelete={canEdit && post.status !== 'posted' ? () => onDelete(post) : null}
            />
          ))
        ) : (
          <Text className="py-6 text-center font-inter-medium text-[15px] leading-6 text-black/50">
            Nothing planned for this day yet.
          </Text>
        )}
      </ScrollView>

      {date && canEdit && upcoming ? (
        <View className="mt-5">
          <Button label="Add content" icon={Plus} onPress={() => onAdd(date)} />
        </View>
      ) : null}
    </BottomSheet>
  );
}
