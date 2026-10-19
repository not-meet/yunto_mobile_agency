import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PROFILE_KEY } from '@/hooks/useProfile';
import {
  addMember,
  type AddMemberRequest,
  assignCreators,
  type AssignCreatorsRequest,
  createTeam,
  type CreateTeamRequest,
  deleteTeam,
  getCreatorAssignment,
  getMember,
  getMemberCreators,
  getMemberLeads,
  getMembers,
  getPeople,
  getTeam,
  getTeams,
  type MemberDetails,
  type Permissions,
  removeFromTeam,
  type Team,
  updateMemberPermissions,
  updateTeam,
  type UpdateTeamRequest,
} from '@/services/teamService';
import { STALE_TIME } from '@/utils/queryCache';

// e.g. ['team', 'list'], ['team', 'detail', 'sales'], ['team', 'leads', 'sales', 'lisa'],
// ['team', 'people'], ['team', 'members'], ['team', 'member', 'lisa'],
// ['team', 'creator-assignment'] and ['team', 'member-creators', 'lisa'].
const TEAM_KEY = ['team'];
const LIST_KEY = [...TEAM_KEY, 'list'];
const PEOPLE_KEY = [...TEAM_KEY, 'people'];
const MEMBERS_KEY = [...TEAM_KEY, 'members'];
const CREATOR_ASSIGNMENT_KEY = [...TEAM_KEY, 'creator-assignment'];
const detailKey = (id: string) => [...TEAM_KEY, 'detail', id];
const leadsKey = (teamId: string, memberId: string) => [...TEAM_KEY, 'leads', teamId, memberId];
const memberKey = (id: string) => [...TEAM_KEY, 'member', id];
const memberCreatorsKey = (id: string) => [...TEAM_KEY, 'member-creators', id];

// Everything that summarises the teams, after one changed. A team's own detail is left alone:
// the mutation that changed it puts the new one in place.
function refreshSummaries(queryClient: QueryClient) {
  const keys = [
    LIST_KEY,
    PEOPLE_KEY,
    MEMBERS_KEY,
    [...TEAM_KEY, 'leads'],
    [...TEAM_KEY, 'member'],
    PROFILE_KEY,
  ];
  for (const queryKey of keys) void queryClient.invalidateQueries({ queryKey });
}

export function useTeams() {
  return useQuery({ queryKey: LIST_KEY, queryFn: getTeams, staleTime: STALE_TIME.owned });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => getTeam(id),
    staleTime: STALE_TIME.owned,
  });
}

export function useMemberLeads(teamId: string, memberId: string) {
  return useQuery({
    queryKey: leadsKey(teamId, memberId),
    queryFn: () => getMemberLeads(teamId, memberId),
    staleTime: STALE_TIME.live,
  });
}

export function usePeople() {
  return useQuery({ queryKey: PEOPLE_KEY, queryFn: getPeople, staleTime: STALE_TIME.live });
}

export function useMembers() {
  return useQuery({ queryKey: MEMBERS_KEY, queryFn: getMembers, staleTime: STALE_TIME.owned });
}

export function useCreatorAssignment() {
  return useQuery({
    queryKey: CREATOR_ASSIGNMENT_KEY,
    queryFn: getCreatorAssignment,
    staleTime: STALE_TIME.owned,
  });
}

// The creators a member is the POC of.
export function useMemberCreators(id: string) {
  return useQuery({
    queryKey: memberCreatorsKey(id),
    queryFn: () => getMemberCreators(id),
    staleTime: STALE_TIME.owned,
  });
}

export function useAssignCreators() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignment: AssignCreatorsRequest) => assignCreators(assignment),
    onSuccess: (assignment, { memberId }) => {
      queryClient.setQueryData(CREATOR_ASSIGNMENT_KEY, assignment);
      void queryClient.invalidateQueries({ queryKey: memberCreatorsKey(memberId) });
    },
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: memberKey(id),
    queryFn: () => getMember(id),
    staleTime: STALE_TIME.owned,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    // The sheet makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({ team, idempotencyKey }: { team: CreateTeamRequest; idempotencyKey: string }) =>
      createTeam(team, idempotencyKey),
    onSuccess: (created) => {
      queryClient.setQueryData(detailKey(created.id), created);
      refreshSummaries(queryClient);
    },
  });
}

export function useUpdateTeam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: UpdateTeamRequest) => updateTeam(id, changes),
    onSuccess: (team) => {
      queryClient.setQueryData(detailKey(id), team);
      refreshSummaries(queryClient);
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    // The detail stays cached until it's collected: dropping it while a screen still shows it
    // would refetch a team that no longer exists.
    onSuccess: (_, id) => {
      queryClient.setQueryData<Team[]>(LIST_KEY, (teams) => teams?.filter((t) => t.id !== id));
      refreshSummaries(queryClient);
    },
  });
}

export function useRemoveFromTeam(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeFromTeam(teamId, memberId),
    onSuccess: (team) => {
      queryClient.setQueryData(detailKey(teamId), team);
      refreshSummaries(queryClient);
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    // The sheet makes `idempotencyKey` once per tap; a retry of that mutation reuses it.
    mutationFn: ({
      member,
      idempotencyKey,
    }: {
      member: AddMemberRequest;
      idempotencyKey: string;
    }) => addMember(member, idempotencyKey),
    onSuccess: (_, { member }) => {
      if (member.teamId) void queryClient.invalidateQueries({ queryKey: detailKey(member.teamId) });
      refreshSummaries(queryClient);
    },
  });
}

// The screen shows `variables` while this is pending, so a switch flips at once.
export function useUpdatePermissions(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissions: Permissions) => updateMemberPermissions(memberId, permissions),
    onSuccess: (member) => {
      queryClient.setQueryData<MemberDetails>(memberKey(memberId), member);
    },
  });
}
