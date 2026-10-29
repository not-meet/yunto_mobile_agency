import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCampaignDeliverables,
  type Campaign,
  type CampaignDetails,
  completeCampaign,
  getCampaign,
  getCampaigns,
  removeCampaignDeliverable,
  setCampaignAssignees,
  setCampaignRequirements,
  updateCampaignDeliverable,
} from '@/services/campaignsService';
import type {
  AddDeliverablesInput,
  SetRequirementsInput,
  UpdateDeliverableInput,
} from '@/services/leadsService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

const CAMPAIGNS_KEY = ['campaigns'];
const campaignKey = (id: string) => ['campaigns', id];
// Home's live campaigns.
const HOME_KEY = ['home'];

export function useCampaigns() {
  return useQuery({ queryKey: CAMPAIGNS_KEY, queryFn: getCampaigns, staleTime: STALE_TIME.live });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKey(id),
    queryFn: () => getCampaign(id),
    staleTime: STALE_TIME.owned,
  });
}

// Puts the campaign as it is now in the cache, and its list card in step without a refetch.
function useStoreCampaign() {
  const queryClient = useQueryClient();
  return (campaign: CampaignDetails) => {
    queryClient.setQueryData(campaignKey(campaign.id), campaign);
    queryClient.setQueryData<Campaign[]>(CAMPAIGNS_KEY, (campaigns) =>
      campaigns?.map((c) =>
        c.id === campaign.id ? { ...c, status: campaign.status, progress: campaign.progress } : c,
      ),
    );
  };
}

export function useCompleteCampaign(id: string) {
  const queryClient = useQueryClient();
  const store = useStoreCampaign();
  return useMutation({
    mutationFn: () => completeCampaign(id, newIdempotencyKey()),
    onSuccess: (campaign) => {
      store(campaign);
      void queryClient.invalidateQueries({ queryKey: HOME_KEY });
    },
  });
}

export function useSetCampaignAssignees(id: string) {
  const store = useStoreCampaign();
  return useMutation({
    mutationFn: (memberIds: string[]) => setCampaignAssignees(id, memberIds),
    onSuccess: store,
  });
}

// Deliverables are the lead's too, so its cached details are refetched along with the change.
function useStoreDeliverables() {
  const queryClient = useQueryClient();
  const store = useStoreCampaign();
  return (campaign: CampaignDetails) => {
    store(campaign);
    void queryClient.invalidateQueries({ queryKey: ['leads', campaign.leadId], exact: true });
  };
}

// The lead's too, like deliverables.
export function useSetCampaignRequirements(id: string) {
  const store = useStoreDeliverables();
  return useMutation({
    mutationFn: (requirements: SetRequirementsInput) => setCampaignRequirements(id, requirements),
    onSuccess: store,
  });
}

export function useAddCampaignDeliverables(id: string) {
  const store = useStoreDeliverables();
  return useMutation({
    // Each add is one user action, so it gets its own Idempotency-Key.
    mutationFn: (input: AddDeliverablesInput) =>
      addCampaignDeliverables(id, input, newIdempotencyKey()),
    onSuccess: store,
  });
}

export function useUpdateCampaignDeliverable(id: string) {
  const store = useStoreDeliverables();
  return useMutation({
    mutationFn: ({
      deliverableId,
      input,
    }: {
      deliverableId: string;
      input: UpdateDeliverableInput;
    }) => updateCampaignDeliverable(id, deliverableId, input),
    onSuccess: store,
  });
}

export function useRemoveCampaignDeliverable(id: string) {
  const store = useStoreDeliverables();
  return useMutation({
    mutationFn: (deliverableId: string) => removeCampaignDeliverable(id, deliverableId),
    onSuccess: store,
  });
}
