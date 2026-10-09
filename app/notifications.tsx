import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import type { NotificationFilter } from '@/components/notifications/labels';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { NotificationsFeed } from '@/components/notifications/NotificationsFeed';
import { NotificationsSkeleton } from '@/components/notifications/NotificationsSkeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// Opened from the bell on home.
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const notifications = useNotifications();
  const pull = usePullToRefresh(notifications);
  const { data } = notifications;

  return (
    <View className="flex-1 bg-[#F7F0E4]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-[15px] py-4">
        <BackButton fallbackHref="/home" />
        <Text
          accessibilityRole="header"
          className="flex-1 font-grotesk-bold text-2xl leading-7 tracking-[-1px] text-espresso"
        >
          Notifications
        </Text>
      </View>

      <NotificationFilters selected={filter} onSelect={setFilter} />

      {data ? (
        <NotificationsFeed
          // Remounted per filter so the cards ease back in.
          key={filter}
          feed={data}
          filter={filter}
          refreshing={pull.refreshing}
          onRefresh={pull.onRefresh}
          bottomInset={insets.bottom}
        />
      ) : notifications.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            We couldn’t load your notifications.
          </Text>
          <View className="self-stretch">
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => void notifications.refetch()}
              loading={notifications.isFetching}
            />
          </View>
        </View>
      ) : (
        <NotificationsSkeleton />
      )}
    </View>
  );
}
