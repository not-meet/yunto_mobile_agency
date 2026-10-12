import { z } from 'zod';

import { mockApiRequest } from '@/dummy/mockApi';
import { mockGetIntegrations, mockSetIntegration } from '@/dummy/integrations';
import { tolerantEnum } from '@/utils/schema';

// The ad and site platforms the agency pulls leads in from, and connecting or disconnecting one.

export const integrationProviderSchema = z.enum(['facebook', 'google-ads', 'wordpress']);
export type IntegrationProvider = z.infer<typeof integrationProviderSchema>;

const integrationSchema = z.object({
  provider: tolerantEnum(integrationProviderSchema.options),
  connected: z.boolean(),
});
export type Integration = z.infer<typeof integrationSchema>;

export async function getIntegrations(): Promise<Integration[]> {
  const { integrations } = await mockApiRequest({
    method: 'GET',
    path: '/integrations',
    response: z.object({ integrations: z.array(integrationSchema) }),
    mock: mockGetIntegrations,
  });
  return integrations;
}

const setIntegrationRequest = z.object({ connected: z.boolean() });

// TODO(oauth): connecting will open the provider's sign-in once the API hands out its link.
export async function setIntegration(
  provider: IntegrationProvider,
  connected: boolean,
): Promise<Integration> {
  const { integration } = await mockApiRequest({
    method: 'PUT',
    path: `/integrations/${integrationProviderSchema.parse(provider)}`,
    request: setIntegrationRequest,
    body: { connected },
    response: z.object({ integration: integrationSchema }),
    mock: (payload) => mockSetIntegration(provider, payload),
  });
  return integration;
}
