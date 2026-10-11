import { z } from 'zod';

import { mockApiRequest } from '@/dummy/mockApi';
import { mockGetProfile, mockUpdateAgencyInfo, mockUpdateProfile } from '@/dummy/profile';
import { AGENCY_CODE_LENGTH } from '@/services/authService';
import { EMAIL_MAX } from '@/services/leadsService';
import { tolerantEnum } from '@/utils/schema';

// The signed-in member's own profile and their agency's details: the profile screen's summary,
// and saving changes to either.

// E.164, e.g. "+919812345678".
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
// "YYYY-MM-DD".
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// A bare host, optionally with a path, e.g. "www.stellartalent.com".
const WEBSITE_PATTERN = /^([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

export const genderSchema = z.enum(['female', 'male', 'other']);
export type Gender = z.infer<typeof genderSchema>;

// What a member is in their team. Shared with the team screens.
export const assignAsSchema = z.enum(['manager', 'lead', 'executive']);
export type AssignAs = z.infer<typeof assignAsSchema>;

const profileSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string(),
  // Shown under the name, e.g. "Super Admin".
  title: z.string().min(1),
  email: z.email(),
  phone: z.string().regex(PHONE_PATTERN).nullable(),
  birthDate: z.string().regex(DATE_KEY_PATTERN).nullable(),
  gender: tolerantEnum(genderSchema.options).nullable(),
  assignAs: tolerantEnum(assignAsSchema.options),
  avatarUrl: z.string().min(1).nullable(),
});
export type Profile = z.infer<typeof profileSchema>;

const agencyInfoSchema = z.object({
  name: z.string().min(1),
  email: z.email().nullable(),
  phone: z.string().regex(PHONE_PATTERN).nullable(),
  website: z.string().regex(WEBSITE_PATTERN).nullable(),
  logoUrl: z.string().min(1).nullable(),
  // Teammates join with it.
  code: z.string().length(AGENCY_CODE_LENGTH),
});
export type AgencyInfo = z.infer<typeof agencyInfoSchema>;

const profileResponse = z.object({
  profile: profileSchema,
  agency: agencyInfoSchema,
  stats: z.object({
    creators: z.number().int().nonnegative(),
    campaigns: z.number().int().nonnegative(),
    teams: z.number().int().nonnegative(),
  }),
});
export type ProfileOverview = z.infer<typeof profileResponse>;

export async function getProfile(): Promise<ProfileOverview> {
  return mockApiRequest({
    method: 'GET',
    path: '/me/profile',
    response: profileResponse,
    mock: mockGetProfile,
  });
}

// Saving the expanded forms. Request messages are what the form shows when Save Changes is
// tapped too early, so they read as instructions.

export const NAME_MAX = 40;
export const AGENCY_NAME_MAX = 80;
export const WEBSITE_MAX = 120;

// TODO(upload): a picked photo is a local file URI until the API takes files.
const photoSchema = z.string().min(1).nullable();

export const updateProfileRequest = z.object({
  firstName: z.string().trim().min(1, 'Add your first name').max(NAME_MAX),
  lastName: z.string().trim().max(NAME_MAX),
  email: z.email('Enter a valid email address').max(EMAIL_MAX),
  phone: z.string().regex(PHONE_PATTERN, 'Enter a valid phone number').nullable(),
  birthDate: z.string().regex(DATE_KEY_PATTERN).nullable(),
  gender: genderSchema.nullable(),
  assignAs: assignAsSchema,
  photo: photoSchema,
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequest>;

export async function updateProfile(profile: UpdateProfileRequest): Promise<Profile> {
  const { profile: updated } = await mockApiRequest({
    method: 'PATCH',
    path: '/me/profile',
    request: updateProfileRequest,
    body: profile,
    response: z.object({ profile: profileSchema }),
    mock: mockUpdateProfile,
  });
  return updated;
}

export const updateAgencyInfoRequest = z.object({
  name: z.string().trim().min(1, 'Add the agency’s name').max(AGENCY_NAME_MAX),
  email: z.email('Enter a valid email address').max(EMAIL_MAX).nullable(),
  phone: z.string().regex(PHONE_PATTERN, 'Enter a valid phone number').nullable(),
  website: z
    .string()
    .max(WEBSITE_MAX)
    .regex(WEBSITE_PATTERN, 'Enter a valid website, e.g. www.stellartalent.com')
    .nullable(),
  logo: photoSchema,
});
export type UpdateAgencyInfoRequest = z.infer<typeof updateAgencyInfoRequest>;

export async function updateAgencyInfo(agency: UpdateAgencyInfoRequest): Promise<AgencyInfo> {
  const { agency: updated } = await mockApiRequest({
    method: 'PATCH',
    path: '/me/agency',
    request: updateAgencyInfoRequest,
    body: agency,
    response: z.object({ agency: agencyInfoSchema }),
    mock: mockUpdateAgencyInfo,
  });
  return updated;
}
