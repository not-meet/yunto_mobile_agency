import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteCalendarPost, getCreatorCalendar } from '@/services/creatorCalendarService';
import { STALE_TIME } from '@/utils/queryCache';

// e.g. ['creators', 'leena', 'calendar', '2026-10'].
export const calendarKey = (creatorId: string) => ['creators', creatorId, 'calendar'];

// Keeps the last month on screen (dimmed) while the next one loads.
export function useCreatorCalendar(creatorId: string, month: string) {
  return useQuery({
    queryKey: [...calendarKey(creatorId), month],
    queryFn: () => getCreatorCalendar(creatorId, month),
    staleTime: STALE_TIME.owned,
    placeholderData: keepPreviousData,
  });
}

export function useDeleteCalendarPost(creatorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deleteCalendarPost(creatorId, postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKey(creatorId) }),
  });
}
