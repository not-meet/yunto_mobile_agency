import { z } from 'zod';

import { mockApiRequest } from '@/dummy/mockApi';
import { mockGetLeadDistribution, mockUpdateLeadDistribution } from '@/dummy/leadDistribution';
import { roleSchema } from '@/services/authService';
import { assignAsSchema } from '@/services/profileService';
import { tolerantEnum } from '@/utils/schema';

// How new leads and campaigns are handed to the team, each set on its own: to anyone at random,
// to everyone at once, or to each person in the sequence in turn. Priority recipients get
// priority ones first, in their own order, before the sequence.

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

export const distributionChannelSchema = z.enum(['leads', 'campaigns']);
export type DistributionChannel = z.infer<typeof distributionChannelSchema>;

export const distributionModeSchema = z.enum(['random', 'broadcast', 'round-robin']);
export type DistributionMode = z.infer<typeof distributionModeSchema>;

const distributionSettingsSchema = z.object({
  mode: tolerantEnum(distributionModeSchema.options),
  // Member ids they go to; round by round hands them out in this order, then loops.
  sequence: z.array(idSchema),
  // Member ids who get priority ones first, first in line first. Empty for no one.
  priority: z.array(idSchema),
});
export type DistributionSettings = z.infer<typeof distributionSettingsSchema>;

const distributionMemberSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  role: tolerantEnum(roleSchema.options),
  assignAs: tolerantEnum(assignAsSchema.options),
});
export type DistributionMember = z.infer<typeof distributionMemberSchema>;

const leadDistributionResponse = z.object({
  leads: distributionSettingsSchema,
  campaigns: distributionSettingsSchema,
  // Everyone who can be added to a sequence or made a priority recipient.
  members: z.array(distributionMemberSchema),
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

const unique = (ids: string[]) => new Set(ids).size === ids.length;

export const updateLeadDistributionRequest = z.object({
  mode: z.enum(distributionModeSchema.options, { error: 'Pick how leads are distributed' }),
  // First in line first, each once.
  sequence: z
    .array(idSchema)
    .min(1, 'Add someone to the sequence')
    .refine(unique, 'Someone is in the sequence twice'),
  priority: z.array(idSchema).refine(unique, 'Someone is a priority recipient twice'),
});
export type UpdateLeadDistributionRequest = z.infer<typeof updateLeadDistributionRequest>;

export async function updateLeadDistribution(
  channel: DistributionChannel,
  settings: UpdateLeadDistributionRequest,
): Promise<LeadDistribution> {
  const path = `/lead-distribution/${distributionChannelSchema.parse(channel)}`;
  return mockApiRequest({
    method: 'PUT',
    path,
    request: updateLeadDistributionRequest,
    body: settings,
    response: leadDistributionResponse,
    mock: (payload) => mockUpdateLeadDistribution(channel, payload),
  });
}
