import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { FILTERS, matchesFilter, type ReminderFilter } from '@/components/reminders/labels';
import { ReminderCard } from '@/components/reminders/ReminderCard';
import { ReminderFilters } from '@/components/reminders/ReminderFilters';
import { RemindersHeader } from '@/components/reminders/RemindersHeader';
import { useReminders } from '@/hooks/useReminders';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// Opened from the bottom nav and from the reminders on home.

const ADD_BUTTON_HEIGHT = 56;
const ADD_BUTTON_GAP = 16;

const EMPTY: Record<ReminderFilter, string> = {
  today: 'Nothing due today.',
  upcoming: 'Nothing coming up.',
  all: 'No reminders yet. Add your first one below.',
};

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const buttonBottom = insets.bottom + ADD_BUTTON_GAP;
  const [filter, setFilter] = useState<ReminderFilter>('today');
  const reminders = useReminders();
  const pull = usePullToRefresh(reminders);
  const { data } = reminders;

  const counts = useMemo(
    () =>
      data &&
      (Object.fromEntries(
        FILTERS.map(({ key }) => [key, data.filter((r) => matchesFilter(r, key)).length]),
      ) as Record<ReminderFilter, number>),
    [data],
  );
  const shown = data?.filter((r) => matchesFilter(r, filter));

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <RemindersHeader title="All Reminders" />

      <ReminderFilters selected={filter} onSelect={setFilter} counts={counts} />

      {shown ? (
        <FlatList
          // Remounted per filter so the cards ease back in.
          key={filter}
          data={shown}
          keyExtractor={(r) => r.id}
          refreshing={pull.refreshing}
          onRefresh={pull.onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 16,
            paddingHorizontal: 20,
            paddingBottom: buttonBottom + ADD_BUTTON_HEIGHT + 16,
          }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 60).duration(300)}>
              <ReminderCard reminder={item} />
            </Animated.View>
          )}
          ListEmptyComponent={
            <Text className="px-6 pt-16 text-center font-inter-medium text-[15px] leading-5 text-muted">
              {EMPTY[filter]}
            </Text>
          }
        />
      ) : reminders.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your reminders.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void reminders.refetch()}
              loading={reminders.isFetching}
            />
          </View>
        </View>
      ) : (
        <ListSkeleton label="Loading reminders" cardHeight={195} withFilters={false} />
      )}

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center"
        style={{ bottom: buttonBottom }}
      >
        <Pressable
          onPress={() => router.push('/reminders/new')}
          accessibilityRole="button"
          accessibilityLabel="Add reminder"
          className="w-[232px] flex-row items-center justify-center gap-2 rounded-[36px] bg-espresso active:opacity-80"
          style={{ height: ADD_BUTTON_HEIGHT }}
        >
          <Plus size={20} color="#FFFEFE" strokeWidth={1.67} />
          <Text className="font-inter-semibold text-base leading-[19px] text-white">
            Add Reminder
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
