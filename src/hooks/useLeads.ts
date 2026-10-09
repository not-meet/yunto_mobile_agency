import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addDeliverableLink,
  convertLead,
  createLead,
  type CreateLeadRequest,
  deleteLead,
  getLead,
  getLeads,
  type Lead,
  type LeadDetails,
} from '@/services/leadsService';
import { newIdempotencyKey } from '@/utils/api';
import { STALE_TIME } from '@/utils/queryCache';

const LEADS_KEY = ['leads'];
const leadKey = (id: string) => ['leads', id];
// Home's Lead Matrix and "new leads" nudge count these.
const HOME_KEY = ['home'];

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
    },
  });
}

export function useDeleteLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteLead(id),
    // The detail stays cached until it's collected: dropping it while the screen is still up
    // would refetch a lead that no longer exists.
    onSuccess: () => {
      queryClient.setQueryData<Lead[]>(LEADS_KEY, (leads) => leads?.filter((l) => l.id !== id));
      void queryClient.invalidateQueries({ queryKey: HOME_KEY });
    },
  });
}

export function useAddDeliverableLink(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // Each submit is one user action, so it gets its own Idempotency-Key.
    mutationFn: (url: string) => addDeliverableLink(id, url, newIdempotencyKey()),
    onSuccess: (link) => {
      queryClient.setQueryData<LeadDetails>(leadKey(id), (lead) =>
        lead ? { ...lead, links: [link, ...lead.links] } : lead,
      );
    },
  });
}
