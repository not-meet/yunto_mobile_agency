import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the integrations screen. Delete with the folder.
//
// Held in memory only: connections are gone after a restart.

type MockProvider = 'facebook' | 'google-ads' | 'wordpress';

const CONNECTED: Record<MockProvider, boolean> = {
  facebook: false,
  'google-ads': false,
  wordpress: false,
};

const PROVIDERS = Object.keys(CONNECTED) as MockProvider[];

// GET /integrations
export function mockGetIntegrations() {
  return {
    integrations: PROVIDERS.map((provider) => ({ provider, connected: CONNECTED[provider] })),
  };
}

// PUT /integrations/:provider
export function mockSetIntegration(
  provider: MockProvider,
  payload: { connected: boolean } | undefined,
) {
  if (!payload) throw new ApiError('Invalid integration', 400, { message: 'Invalid integration' });
  CONNECTED[provider] = payload.connected;
  return { integration: { provider, connected: CONNECTED[provider] } };
}
