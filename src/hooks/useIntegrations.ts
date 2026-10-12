import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getIntegrations,
  type Integration,
  type IntegrationProvider,
  setIntegration,
} from '@/services/integrationsService';
import { STALE_TIME } from '@/utils/queryCache';

const INTEGRATIONS_KEY = ['integrations'];

export function useIntegrations() {
  return useQuery({
    queryKey: INTEGRATIONS_KEY,
    queryFn: getIntegrations,
    staleTime: STALE_TIME.owned,
  });
}

// The screen shows `variables` while this is pending, so only that card's button spins.
export function useSetIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, connected }: { provider: IntegrationProvider; connected: boolean }) =>
      setIntegration(provider, connected),
    onSuccess: (updated) => {
      queryClient.setQueryData<Integration[]>(INTEGRATIONS_KEY, (current) =>
        current?.map((i) => (i.provider === updated.provider ? updated : i)),
      );
    },
  });
}
