import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addLeadDeliverables,
  type AddDeliverablesInput,
  convertLead,
  createLead,
  type CreateLeadRequest,
  deleteLead,
  getLead,
  getLeads,
  type Lead,
  type LeadDetails,
  type LeadIntent,
  removeLeadDeliverable,
  setLeadAssignees,
  setLeadIntent,
  setLeadRequirements,
  type SetRequirementsInput,
  type UpdateDeliverableInput,
  updateLeadDeliverable,
} from '@/services/leadsService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

const LEADS_KEY = ['leads'];
const leadKey = (id: string) => ['leads', id];
// Home's Lead Matrix and "new leads" nudge count these.
const HOME_KEY = ['home'];
const CAMPAIGNS_KEY = ['campaigns'];

export function useLeads() {
  return useQuery({ queryKey: LEADS_KEY, queryFn: getLeads, staleTime: STALE_TIME.live });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKey(id),
    queryFn: () => getLead(id),
    staleTime: STALE_TIME.owned,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    // The screen makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({ lead, idempotencyKey }: { lead: CreateLeadRequest; idempotencyKey: string }) =>
      createLead(lead, idempotencyKey),
    onSuccess: () => {
      // Exact, so cached lead details aren't refetched along with the list.
      void queryClient.invalidateQueries({ queryKey: LEADS_KEY, exact: true });
      void queryClient.invalidateQueries({ queryKey: HOME_KEY });
    },
  });
}

export function useConvertLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => convertLead(id, newIdempotencyKey()),
    onSuccess: (lead) => {
      queryClient.setQueryData(leadKey(id), lead);
      // The list card moves under "Campaign" without a refetch.
      queryClient.setQueryData<Lead[]>(LEADS_KEY, (leads) =>
        leads?.map((l) =>
          l.id === id ? { ...l, status: lead.status, needsResponse: lead.needsResponse } : l,
        ),
      );
      // The conversion is logged on the timeline.
      void queryClient.invalidateQueries({ queryKey: [...leadKey(id), 'activity'] });
      void queryClient.invalidateQueries({ queryKey: HOME_KEY });
      // It joins the campaigns list.
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY, exact: true });
    },
  });
}

// Takes the lead's id per call, so the list can delete any of its cards.
export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    // The detail stays cached until it's collected: dropping it while the screen is still up
    // would refetch a lead that no longer exists.
    onSuccess: (_, id) => {
      queryClient.setQueryData<Lead[]>(LEADS_KEY, (leads) => leads?.filter((l) => l.id !== id));
      void queryClient.invalidateQueries({ queryKey: HOME_KEY });
    },
  });
}

// Shown straight away; put back if the server says no.
export function useSetLeadIntent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (intent: LeadIntent) => setLeadIntent(id, intent),
    onMutate: async (intent) => {
      await queryClient.cancelQueries({ queryKey: leadKey(id), exact: true });
      const previous = queryClient.getQueryData<LeadDetails>(leadKey(id));
      queryClient.setQueryData<LeadDetails>(leadKey(id), (lead) =>
        lead ? { ...lead, intent } : lead,
      );
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(leadKey(id), context.previous);
    },
    onSuccess: (lead) => {
      queryClient.setQueryData(leadKey(id), lead);
      // A new lead moves under "Contacted".
      queryClient.setQueryData<Lead[]>(LEADS_KEY, (leads) =>
        leads?.map((l) => (l.id === id ? { ...l, status: lead.status } : l)),
      );
      // The change is logged on the timeline.
      void queryClient.invalidateQueries({ queryKey: [...leadKey(id), 'activity'] });
      void queryClient.invalidateQueries({ queryKey: HOME_KEY });
    },
  });
}

export function useSetLeadAssignees(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberIds: string[]) => setLeadAssignees(id, memberIds),
    onSuccess: (lead) => queryClient.setQueryData(leadKey(id), lead),
  });
}

// Puts the lead as it is now in the cache. Its campaign shares the deliverables, so that's
// refetched too.
function useStoreDeliverables(id: string) {
  const queryClient = useQueryClient();
  return (lead: LeadDetails) => {
    queryClient.setQueryData(leadKey(id), lead);
    if (lead.campaignId) {
      void queryClient.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, lead.campaignId] });
    }
  };
}

// The campaign shares them too.
export function useSetLeadRequirements(id: string) {
  const store = useStoreDeliverables(id);
  return useMutation({
    mutationFn: (requirements: SetRequirementsInput) => setLeadRequirements(id, requirements),
    onSuccess: store,
  });
}

export function useAddLeadDeliverables(id: string) {
  const store = useStoreDeliverables(id);
  return useMutation({
    // Each add is one user action, so it gets its own Idempotency-Key.
    mutationFn: (input: AddDeliverablesInput) =>
      addLeadDeliverables(id, input, newIdempotencyKey()),
    onSuccess: store,
  });
}

export function useUpdateLeadDeliverable(id: string) {
  const store = useStoreDeliverables(id);
  return useMutation({
    mutationFn: ({
      deliverableId,
      input,
    }: {
      deliverableId: string;
      input: UpdateDeliverableInput;
    }) => updateLeadDeliverable(id, deliverableId, input),
    onSuccess: store,
  });
}

export function useRemoveLeadDeliverable(id: string) {
  const store = useStoreDeliverables(id);
  return useMutation({
    mutationFn: (deliverableId: string) => removeLeadDeliverable(id, deliverableId),
    onSuccess: store,
  });
}
