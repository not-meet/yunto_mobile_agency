import { mockTeamCount } from '@/dummy/team';
import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the profile screens. Delete with the folder.
//
// Held in memory only: saved changes are gone after a restart.

type MockGender = 'female' | 'male' | 'other';
type MockAssignAs = 'manager' | 'lead' | 'executive';

const PROFILE = {
  id: 'usr_1',
  firstName: 'Rohit',
  lastName: 'Kumar',
  title: 'Super Admin',
  email: 'rohitkumar@gmail.com',
  phone: '+919876501234' as string | null,
  birthDate: '2001-01-01' as string | null,
  gender: 'male' as MockGender | null,
  assignAs: 'manager' as MockAssignAs,
  avatarUrl: 'https://picsum.photos/seed/yunto-me-rohit/192/192' as string | null,
};

const AGENCY = {
  name: 'Stellar Talents',
  email: 'rohitkumar@gmail.com' as string | null,
  phone: '+919876501234' as string | null,
  website: 'www.stellartalent.com' as string | null,
  logoUrl: null as string | null,
  code: '55678',
};

// GET /me/profile
export function mockGetProfile() {
  return {
    profile: { ...PROFILE },
    agency: { ...AGENCY },
    stats: { creators: 24, campaigns: 8, teams: mockTeamCount() },
  };
}

// PATCH /me/profile
export function mockUpdateProfile(
  payload:
    | {
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        birthDate: string | null;
        gender: MockGender | null;
        assignAs: MockAssignAs;
        photo: string | null;
      }
    | undefined,
) {
  if (!payload) throw new ApiError('Invalid profile', 400, { message: 'Invalid profile' });
  const { photo, ...changes } = payload;
  Object.assign(PROFILE, changes, photo ? { avatarUrl: photo } : null);
  return { profile: { ...PROFILE } };
}

// PATCH /me/agency
export function mockUpdateAgencyInfo(
  payload:
    | {
        name: string;
        email: string | null;
        phone: string | null;
        website: string | null;
        logo: string | null;
      }
    | undefined,
) {
  if (!payload) throw new ApiError('Invalid agency', 400, { message: 'Invalid agency' });
  const { logo, ...changes } = payload;
  Object.assign(AGENCY, changes, logo ? { logoUrl: logo } : null);
  return { agency: { ...AGENCY } };
}
