import { router, useLocalSearchParams } from 'expo-router';
import { Eye, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ConfirmSheet } from '@/components/common/ConfirmSheet';
import { Reveal } from '@/components/common/Reveal';
import { SegmentedFilter } from '@/components/common/SegmentedFilter';
import { CalendarDaySheet } from '@/components/creators/CalendarDaySheet';
import { CalendarSummary } from '@/components/creators/CalendarSummary';
import { CreatorCalendar } from '@/components/creators/CreatorCalendar';
import { CALENDAR_FILTERS, type CalendarPlatformFilter } from '@/components/creators/labels';
import { MonthSwitcher } from '@/components/creators/MonthSwitcher';
import { useCreatorCalendar, useDeleteCalendarPost } from '@/hooks/useCreatorCalendar';
import { useCreator } from '@/hooks/useCreators';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type { CalendarPost } from '@/services/creatorCalendarService';
import { addMonths, monthKey, todayDate, todayKey } from '@/utils/dates';
import { showToast } from '@/utils/notifications';

// One creator's content calendar, opened from "Manage Calendar" / "View Calendar" on their
// profile with the creator's `id` (as on the web). The month's pieces by platform, a tap on a day
// lists them and opens one in the content editor, and for the agency's own creators a piece can
// be written there or taken off. Creators off the roster are view only.

export default function CreatorCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const creator = useCreator(id);

  const [month, setMonth] = useState(() => addMonths(todayDate(), 0));
  const [filter, setFilter] = useState<CalendarPlatformFilter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<CalendarPost | null>(null);

  const calendar = useCreatorCalendar(id, monthKey(month));
  const remove = useDeleteCalendarPost(id);
  const pull = usePullToRefresh(calendar);
  const { data } = calendar;
  const canEdit = data?.canEdit ?? false;

  const posts = (data?.posts ?? []).filter((p) => filter === 'all' || p.platform === filter);
  const postsByDay = new Map<string, CalendarPost[]>();
  for (const post of posts) postsByDay.set(post.date, [...(postsByDay.get(post.date) ?? []), post]);

  const openEditor = (date: string, post?: CalendarPost) => {
    setSelected(null);
    router.push({
      pathname: '/creators/content',
      params: post ? { id, date, post: post.id } : { id, date },
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        showToast('Content removed');
        setDeleting(null);
      },
    });
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-5 px-4 py-5">
        <BackButton tone="dark" fallbackHref={{ pathname: '/creators/[id]', params: { id } }} />
        <View className="flex-1 gap-[5px]">
          <Text
            accessibilityRole="header"
            className="font-geist-medium text-xl leading-6 tracking-[-0.6px] text-[#141311]"
          >
            {data && !canEdit ? 'View Calendar' : 'Manage Calendar'}
          </Text>
          <Text
            numberOfLines={1}
            className="font-inter-medium text-[10px] leading-[11px] text-black/70"
          >
            {creator.data?.name ?? ' '}
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            colors={['#1F1A17']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Reveal order={0}>
          <View className="flex-row items-center justify-between gap-3">
            <MonthSwitcher
              month={month}
              onChange={(step) => {
                setMonth((current) => addMonths(current, step));
                setSelected(null);
              }}
            />
            {data && !canEdit ? (
              <View className="h-8 flex-row items-center gap-1.5 rounded-full border border-white/80 bg-white/60 px-3">
                <Eye size={12} color="#787486" strokeWidth={1.75} />
                <Text className="font-inter-semibold text-xs leading-4 text-muted">View only</Text>
              </View>
            ) : null}
          </View>
        </Reveal>

        <Reveal order={1}>
          <SegmentedFilter options={CALENDAR_FILTERS} selected={filter} onSelect={setFilter} />
        </Reveal>

        {calendar.isError && !data ? (
          <View className="items-center gap-4 py-16">
            <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
              We couldn’t load this calendar.
            </Text>
            <View className="self-stretch">
              <Button
                label="Try again"
                variant="secondary"
                onPress={() => void calendar.refetch()}
                loading={calendar.isFetching}
              />
            </View>
          </View>
        ) : (
          <>
            <Reveal order={2}>
              <CalendarSummary posts={posts} />
            </Reveal>
            <Reveal order={3}>
              <CreatorCalendar
                month={month}
                postsByDay={postsByDay}
                selected={selected}
                loading={!data || calendar.isPlaceholderData}
                canAdd={canEdit}
                onSelectDay={setSelected}
                onAddToday={() => openEditor(todayKey())}
              />
            </Reveal>
          </>
        )}
      </ScrollView>

      <CalendarDaySheet
        date={selected}
        posts={selected ? (postsByDay.get(selected) ?? []) : []}
        canEdit={canEdit}
        onClose={() => setSelected(null)}
        onAdd={openEditor}
        onOpen={(post) => openEditor(post.date, post)}
        onDelete={(post) => {
          setSelected(null);
          remove.reset();
          setDeleting(post);
        }}
      />
      <ConfirmSheet
        visible={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete this piece?"
        message={`“${deleting?.title ?? ''}” comes off ${creator.data?.name ?? 'the creator'}’s calendar.`}
        icon={Trash2}
        tone={{ color: '#E11D48', background: 'rgba(225, 29, 72, 0.08)' }}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        busy={remove.isPending}
        error={remove.isError ? 'We couldn’t delete this. Please try again.' : null}
      />
    </View>
  );
}
