import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getLeadDistribution,
  updateLeadDistribution,
  type UpdateLeadDistributionRequest,
} from '@/services/leadDistributionService';
import { apiErrorCode } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

const LEAD_DISTRIBUTION_KEY = ['lead-distribution'];

export const MEMBERS_CHANGED = 'members_changed';

export function useLeadDistribution() {
  return useQuery({
    queryKey: LEAD_DISTRIBUTION_KEY,
    queryFn: getLeadDistribution,
    staleTime: STALE_TIME.owned,
  });
}

export function useUpdateLeadDistribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (distribution: UpdateLeadDistributionRequest) =>
      updateLeadDistribution(distribution),
    onSuccess: (distribution) => queryClient.setQueryData(LEAD_DISTRIBUTION_KEY, distribution),
    // Someone joined or left since the screen loaded: show the current team.
    onError: (error) => {
      if (apiErrorCode(error) === MEMBERS_CHANGED) {
        void queryClient.invalidateQueries({ queryKey: LEAD_DISTRIBUTION_KEY });
      }
    },
  });
}
