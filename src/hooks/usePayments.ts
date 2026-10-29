import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveLeadPayout,
  getCampaignPayments,
  getLeadPayments,
  type Payments,
  setCampaignAgencyFee,
  setLeadAgencyFee,
  updateLeadPayout,
} from '@/services/paymentsService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

interface AgencyFeeChange {
  groupKey: string;
  percent: number;
}

// Under the lead's or the campaign's own cache entry.
const leadPaymentsKey = (id: string) => ['leads', id, 'payments'];
const campaignKey = (id: string) => ['campaigns', id];
const campaignPaymentsKey = (id: string) => [...campaignKey(id), 'payments'];
const CAMPAIGNS_KEY = ['campaigns'];

export function useLeadPayments(id: string) {
  return useQuery({
    queryKey: leadPaymentsKey(id),
    queryFn: () => getLeadPayments(id),
    staleTime: STALE_TIME.owned,
  });
}

// A payout or fee agreed on the lead carries over to its campaign, so the campaign's summaries refetch.
function useLeadPayoutMutation<T>(
  id: string,
  mutationFn: (variables: T) => Promise<Payments>,
  { refetchLead = false } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (payments) => {
      queryClient.setQueryData(leadPaymentsKey(id), payments);
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      if (refetchLead) void queryClient.invalidateQueries({ queryKey: ['leads', id], exact: true });
    },
  });
}

export function useUpdateLeadPayout(id: string) {
  return useLeadPayoutMutation(id, ({ creatorId, amount }: { creatorId: string; amount: number }) =>
    updateLeadPayout(id, creatorId, amount),
  );
}

export function useApproveLeadPayout(id: string) {
  return useLeadPayoutMutation(id, (creatorId: string) =>
    approveLeadPayout(id, creatorId, newIdempotencyKey()),
  );
}

// The lead's own payment card shows the agency fee too, so it refetches as well.
export function useSetLeadAgencyFee(id: string) {
  return useLeadPayoutMutation(
    id,
    ({ groupKey, percent }: AgencyFeeChange) => setLeadAgencyFee(id, groupKey, percent),
    { refetchLead: true },
  );
}

export function useCampaignPayments(id: string) {
  return useQuery({
    queryKey: campaignPaymentsKey(id),
    queryFn: () => getCampaignPayments(id),
    staleTime: STALE_TIME.owned,
  });
}

// After a fee changes, the campaign's own payment card is out of date too.
export function useSetCampaignAgencyFee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupKey, percent }: AgencyFeeChange) =>
      setCampaignAgencyFee(id, groupKey, percent),
    onSuccess: (payments) => {
      queryClient.setQueryData(campaignPaymentsKey(id), payments);
      void queryClient.invalidateQueries({ queryKey: campaignKey(id), exact: true });
    },
  });
}

// Either of the above, for the fee sheet.
export type AgencyFeeMutation = ReturnType<typeof useSetCampaignAgencyFee>;
