import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createReminder, type CreateReminderInput, getReminders } from '@/services/reminderService';
import { STALE_TIME } from '@/utils/queryCache';

const REMINDERS_KEY = ['reminders'];

export function useReminders() {
  return useQuery({ queryKey: REMINDERS_KEY, queryFn: getReminders, staleTime: STALE_TIME.owned });
}

// TODO(notifications): schedule a local notification for the morning a reminder is due, like
// yunto_mobile_app does, once src/utils/notifications.ts has scheduling.
export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    // The screen makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: CreateReminderInput;
      idempotencyKey: string;
    }) => createReminder(input, idempotencyKey),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: REMINDERS_KEY }),
  });
}
