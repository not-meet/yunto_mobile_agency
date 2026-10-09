import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  dismissAttention,
  getNotifications,
  markNotificationRead,
  type Notifications,
} from '@/services/notificationService';
import { showToast } from '@/utils/notifications';
import { STALE_TIME } from '@/utils/queryCache';

const NOTIFICATIONS_KEY = ['notifications'];

// TODO(notifications): switch to useInfiniteQuery and load older days on scroll once the API
// paginates; today the whole feed comes back in one call.
export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: getNotifications,
    staleTime: STALE_TIME.live,
  });
}

// Applies `change` to the cached feed straight away; on failure, refetches to undo it.
function useOptimisticNotifications(
  mutationFn: (id: string) => Promise<void>,
  change: (feed: Notifications, id: string) => Notifications,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.setQueryData<Notifications>(
        NOTIFICATIONS_KEY,
        (feed) => feed && change(feed, id),
      );
    },
    onError: () => {
      showToast('Couldn’t update that. Please try again.');
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
    // Home's bell shows the unread count.
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });
}

export function useDismissAttention() {
  return useOptimisticNotifications(dismissAttention, (feed, id) => ({
    ...feed,
    attention: feed.attention.filter((item) => item.id !== id),
  }));
}

export function useMarkNotificationRead() {
  return useOptimisticNotifications(markNotificationRead, (feed, id) => ({
    ...feed,
    notifications: feed.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  }));
}
