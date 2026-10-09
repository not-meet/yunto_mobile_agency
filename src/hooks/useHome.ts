import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getHomeDashboard,
  setRevenueTarget,
  toggleReminder,
  type HomeDashboard,
} from '@/services/homeService';

const HOME_KEY = ['home'] as const;

export function useHomeDashboard() {
  return useQuery({ queryKey: HOME_KEY, queryFn: getHomeDashboard });
}

function usePatchHome() {
  const queryClient = useQueryClient();
  return (patch: (home: HomeDashboard) => HomeDashboard) =>
    queryClient.setQueryData<HomeDashboard>(HOME_KEY, (home) => (home ? patch(home) : home));
}

export function useSetRevenueTarget() {
  const patch = usePatchHome();
  return useMutation({
    mutationFn: setRevenueTarget,
    onSuccess: (revenue) => patch((home) => ({ ...home, revenue })),
  });
}

// Ticks the reminder straight away so the checkbox feels instant, and unticks it if saving fails.
export function useToggleReminder() {
  const patch = usePatchHome();
  const setDone = (id: string, done: boolean) =>
    patch((home) => ({
      ...home,
      reminders: home.reminders.map((r) => (r.id === id ? { ...r, done } : r)),
    }));

  return useMutation({
    mutationFn: toggleReminder,
    onMutate: ({ id, done }) => setDone(id, done),
    onError: (_error, { id, done }) => setDone(id, !done),
    onSuccess: (reminder) =>
      patch((home) => ({
        ...home,
        reminders: home.reminders.map((r) => (r.id === reminder.id ? reminder : r)),
      })),
  });
}
