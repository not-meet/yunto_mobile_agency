import { z } from 'zod';

import { mockApiRequest } from '@/dummy/mockApi';
import { mockGetLeadDistribution, mockUpdateLeadDistribution } from '@/dummy/leadDistribution';
import { tolerantEnum } from '@/utils/schema';

// How new leads are handed to the team: to anyone at random, to everyone at once, or to each
// member in turn in the order the agency sets.

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

export const distributionModeSchema = z.enum(['random', 'broadcast', 'round-robin']);
export type DistributionMode = z.infer<typeof distributionModeSchema>;

const leadDistributionResponse = z.object({
  mode: tolerantEnum(distributionModeSchema.options),
  // Everyone leads go to; round by round hands them out in this order.
  members: z.array(z.object({ id: idSchema, name: z.string().min(1) })),
});
export type LeadDistribution = z.infer<typeof leadDistributionResponse>;

export async function getLeadDistribution(): Promise<LeadDistribution> {
  return mockApiRequest({
    method: 'GET',
    path: '/lead-distribution',
    response: leadDistributionResponse,
    mock: mockGetLeadDistribution,
  });
}

export const updateLeadDistributionRequest = z.object({
  mode: z.enum(distributionModeSchema.options, { error: 'Pick how leads are distributed' }),
  // Member ids, first in line first.
  order: z.array(idSchema),
});
export type UpdateLeadDistributionRequest = z.infer<typeof updateLeadDistributionRequest>;

export async function updateLeadDistribution(
  distribution: UpdateLeadDistributionRequest,
): Promise<LeadDistribution> {
  return mockApiRequest({
    method: 'PUT',
    path: '/lead-distribution',
    request: updateLeadDistributionRequest,
    body: distribution,
    response: leadDistributionResponse,
    mock: mockUpdateLeadDistribution,
  });
}
