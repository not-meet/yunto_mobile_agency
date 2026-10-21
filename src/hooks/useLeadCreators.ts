import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addLeadCreators,
  getLeadCreator,
  getLeadCreators,
  type LeadCreator,
  type LeadCreatorDetails,
  removeLeadCreators,
  setLeadCreatorStatus,
  type SetCreatorStatusRequest,
} from '@/services/leadCreatorsService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

// Under the lead's own cache entry, e.g. ['leads', 'lead_01', 'creators'].
const creatorsKey = (leadId: string) => ['leads', leadId, 'creators'];
const creatorKey = (leadId: string, creatorId: string) => [...creatorsKey(leadId), creatorId];

export function useLeadCreators(leadId: string) {
  return useQuery({
    queryKey: creatorsKey(leadId),
    queryFn: () => getLeadCreators(leadId),
    staleTime: STALE_TIME.owned,
  });
}

export function useLeadCreator(leadId: string, creatorId: string) {
  return useQuery({
    queryKey: creatorKey(leadId, creatorId),
    queryFn: () => getLeadCreator(leadId, creatorId),
    staleTime: STALE_TIME.owned,
  });
}

export function useAddLeadCreators(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creatorIds: string[]) => addLeadCreators(leadId, creatorIds, newIdempotencyKey()),
    onSuccess: (creators) => {
      queryClient.setQueryData<LeadCreator[]>(creatorsKey(leadId), creators);
    },
  });
}

export function useSetLeadCreatorStatus(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // Each tap is one user action, so it gets its own Idempotency-Key.
    mutationFn: (update: SetCreatorStatusRequest) =>
      setLeadCreatorStatus(leadId, update, newIdempotencyKey()),
    onSuccess: (updated) => {
      const byId = new Map(updated.map((c) => [c.id, c]));
      queryClient.setQueryData<LeadCreator[]>(creatorsKey(leadId), (creators) =>
        creators?.map((c) => byId.get(c.id) ?? c),
      );
      for (const creator of updated) {
        queryClient.setQueryData<LeadCreatorDetails>(creatorKey(leadId, creator.id), (details) =>
          details ? { ...details, status: creator.status } : details,
        );
        // The change is logged on the creator's timeline.
        void queryClient.invalidateQueries({
          queryKey: creatorKey(leadId, creator.id),
          exact: true,
        });
      }
    },
  });
}

export function useRemoveLeadCreators(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creatorIds: string[]) =>
      removeLeadCreators(leadId, creatorIds, newIdempotencyKey()),
    onSuccess: (_, creatorIds) => {
      queryClient.setQueryData<LeadCreator[]>(creatorsKey(leadId), (creators) =>
        creators?.filter((c) => !creatorIds.includes(c.id)),
      );
    },
  });
}
