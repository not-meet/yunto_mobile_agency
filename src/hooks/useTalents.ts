import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bookTalent,
  type BookTalentRequest,
  getTalent,
  getTalents,
  type IndianState,
  type ShootTier,
  type TalentCategory,
  type TalentListItem,
  type TalentRole,
} from '@/services/talentService';
import { STALE_TIME } from '@/utils/queryCache';

interface TalentFilters {
  // null shows every style.
  category: TalentCategory | null;
  // Talents based here come first; the rest keep their order.
  state: IndianState;
  // Only talents at this level (the flame picked under the deck).
  level: ShootTier;
}

export function useTalents(role: TalentRole, { category, state, level }: TalentFilters) {
  return useQuery({
    queryKey: ['talents', role],
    queryFn: () => getTalents(role),
    staleTime: STALE_TIME.owned,
    select: (talents: TalentListItem[]) =>
      talents
        .filter((t) => t.level === level && (!category || t.categories.includes(category)))
        .sort((a, b) => Number(b.location.state === state) - Number(a.location.state === state)),
  });
}

export function useTalent(id: string) {
  return useQuery({
    queryKey: ['talents', 'detail', id],
    queryFn: () => getTalent(id),
    staleTime: STALE_TIME.owned,
  });
}

// A campaign booking also creates (or joins) the creator's talent campaign for that role, so the
// talent requests list and the campaign's add-ons are refetched.
export function useBookTalent(talentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // The screen makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({
      booking,
      idempotencyKey,
    }: {
      booking: BookTalentRequest;
      idempotencyKey: string;
    }) => bookTalent(talentId, booking, idempotencyKey),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['talent-campaigns'], exact: true });
      if (created.campaignId) {
        void queryClient.invalidateQueries({ queryKey: ['campaigns', created.campaignId] });
      }
    },
  });
}
