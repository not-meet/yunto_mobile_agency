import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addLeadNote,
  type FollowUp,
  getLeadActivity,
  type NotesActivity,
  scheduleLeadFollowUp,
} from '@/services/leadActivityService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

// Under the lead's own cache entry, e.g. ['leads', 'lead_01', 'activity'].
const activityKey = (leadId: string) => ['leads', leadId, 'activity'];

export function useLeadActivity(leadId: string) {
  return useQuery({
    queryKey: activityKey(leadId),
    queryFn: () => getLeadActivity(leadId),
    staleTime: STALE_TIME.owned,
  });
}

export function useAddLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // Each save is one user action, so it gets its own Idempotency-Key.
    mutationFn: (text: string) => addLeadNote(leadId, text, newIdempotencyKey()),
    onSuccess: (note) => {
      queryClient.setQueryData<NotesActivity>(activityKey(leadId), (current) =>
        current ? { ...current, notes: [note, ...current.notes] } : current,
      );
    },
  });
}

export function useScheduleLeadFollowUp(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (followUp: FollowUp) => scheduleLeadFollowUp(leadId, followUp, newIdempotencyKey()),
    onSuccess: ({ followUp, activity }) => {
      queryClient.setQueryData<NotesActivity>(activityKey(leadId), (current) =>
        current ? { ...current, followUp, activity: [activity, ...current.activity] } : current,
      );
    },
  });
}
