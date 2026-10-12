import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { applyLeave, type ApplyLeaveRequest, getLeaves } from '@/services/leaveService';
import { STALE_TIME } from '@/utils/queryCache';

const LEAVES_KEY = ['leaves'];

export function useLeaves() {
  return useQuery({ queryKey: LEAVES_KEY, queryFn: getLeaves, staleTime: STALE_TIME.owned });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    // The sheet makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({ leave, idempotencyKey }: { leave: ApplyLeaveRequest; idempotencyKey: string }) =>
      applyLeave(leave, idempotencyKey),
    // The response is the new balance and requests, so the card updates without a refetch.
    onSuccess: (leaves) => queryClient.setQueryData(LEAVES_KEY, leaves),
  });
}
