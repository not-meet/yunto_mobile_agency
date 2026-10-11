import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getProfile,
  type ProfileOverview,
  updateAgencyInfo,
  type UpdateAgencyInfoRequest,
  updateProfile,
  type UpdateProfileRequest,
} from '@/services/profileService';
import { STALE_TIME } from '@/utils/queryCache';

// The team screens invalidate it too, since it counts the teams.
export const PROFILE_KEY = ['profile'];

export function useProfile() {
  return useQuery({ queryKey: PROFILE_KEY, queryFn: getProfile, staleTime: STALE_TIME.owned });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: UpdateProfileRequest) => updateProfile(profile),
    onSuccess: (profile) => {
      queryClient.setQueryData<ProfileOverview>(PROFILE_KEY, (current) =>
        current ? { ...current, profile } : current,
      );
    },
  });
}

export function useUpdateAgencyInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agency: UpdateAgencyInfoRequest) => updateAgencyInfo(agency),
    onSuccess: (agency) => {
      queryClient.setQueryData<ProfileOverview>(PROFILE_KEY, (current) =>
        current ? { ...current, agency } : current,
      );
    },
  });
}
