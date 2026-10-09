import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type CampaignChat,
  type CampaignRequests,
  confirmCampaignRequest,
  getCampaignChat,
  getCampaignRequests,
  getTalentCampaigns,
  sendChatMessage,
} from '@/services/talentCampaignService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

export function useTalentCampaigns() {
  return useQuery({ queryKey: ['talent-campaigns'], queryFn: getTalentCampaigns });
}

const requestsKey = (id: string) => ['talent-campaigns', id, 'requests'];

export function useCampaignRequests(id: string) {
  return useQuery({ queryKey: requestsKey(id), queryFn: () => getCampaignRequests(id) });
}

// Confirms an accepted talent for the campaign. The brand campaign it hires for shows the
// confirmed talent too, so that's refetched as well.
export function useConfirmRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => confirmCampaignRequest(id, requestId),
    onSuccess: (requests) => {
      queryClient.setQueryData<CampaignRequests>(requestsKey(id), requests);
      void queryClient.invalidateQueries({ queryKey: ['talent-campaigns'], exact: true });
      void queryClient.invalidateQueries({ queryKey: ['campaigns', requests.campaign.campaignId] });
    },
  });
}

const chatKey = (campaignId: string, requestId: string) => [
  'talent-campaigns',
  campaignId,
  'chat',
  requestId,
];

export function useCampaignChat(campaignId: string, requestId: string) {
  return useQuery({
    queryKey: chatKey(campaignId, requestId),
    queryFn: () => getCampaignChat(campaignId, requestId),
    staleTime: STALE_TIME.live,
  });
}

// Each send is one user action, so it gets its own Idempotency-Key.
export function useSendChatMessage(campaignId: string, requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendChatMessage(campaignId, requestId, text, newIdempotencyKey()),
    onSuccess: (messages) => {
      queryClient.setQueryData<CampaignChat>(chatKey(campaignId, requestId), (current) =>
        current ? { ...current, messages: [...current.messages, ...messages] } : current,
      );
    },
  });
}
