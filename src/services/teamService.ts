import { z } from 'zod';

import { mockApiRequest } from '@/dummy/mockApi';
import {
  mockAddMember,
  mockAssignCreators,
  mockCreateTeam,
  mockGetCreatorAssignment,
  mockDeleteTeam,
  mockGetMember,
  mockGetMemberCreators,
  mockGetMemberLeads,
  mockGetMembers,
  mockGetPeople,
  mockGetTeam,
  mockGetTeams,
  mockRemoveFromTeam,
  mockUpdateMemberPermissions,
  mockUpdateTeam,
} from '@/dummy/team';
import { roleSchema } from '@/services/authService';
import { EMAIL_MAX } from '@/services/leadsService';
import { assignAsSchema } from '@/services/profileService';
import { tolerantEnum } from '@/utils/schema';

// The agency's people and how they're split into teams: the teams themselves, a team's numbers
// and members, one member's leads within a team, the people overview, one member's details and
// what they're allowed to do, and inviting someone new.

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

// E.164, e.g. "+919812345678".
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
// "YYYY-MM-DD".
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const dateKeySchema = z.string().regex(DATE_KEY_PATTERN);

const countSchema = z.number().int().nonnegative();

// What the team works on: decides its tint and how a member's leads are filtered.
export const teamFocusSchema = z.enum(['sales', 'operations', 'mixed']);
export type TeamFocus = z.infer<typeof teamFocusSchema>;

// "invited": hasn't accepted the invite yet. "offline": not signed in today.
const memberStatusSchema = tolerantEnum(['active', 'invited', 'offline']);
export type MemberStatus = z.infer<typeof memberStatusSchema>;

const employmentTypeSchema = tolerantEnum(['full-time', 'part-time', 'contract', 'intern']);
export type EmploymentType = z.infer<typeof employmentTypeSchema>;

const teamSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  focus: tolerantEnum(teamFocusSchema.options),
  members: countSchema,
  // Members signed in today.
  active: countSchema,
});
export type Team = z.infer<typeof teamSchema>;

const memberSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  avatarUrl: z.url().nullable(),
  // What they can see in the app.
  role: tolerantEnum(roleSchema.options),
  assignAs: tolerantEnum(assignAsSchema.options),
  status: memberStatusSchema,
});
export type Member = z.infer<typeof memberSchema>;

const teamPath = (id: string) => `/teams/${encodeURIComponent(idSchema.parse(id))}`;
const memberPath = (id: string) => `/members/${encodeURIComponent(idSchema.parse(id))}`;
const okResponse = z.object({ ok: z.literal(true) });

const teamsResponse = z.object({ teams: z.array(teamSchema) });

export async function getTeams(): Promise<Team[]> {
  const { teams } = await mockApiRequest({
    method: 'GET',
    path: '/teams',
    response: teamsResponse,
    mock: mockGetTeams,
  });
  return teams;
}

const teamDetailsSchema = teamSchema.extend({
  // New leads are handed to this team's members in turn.
  autoAssign: z.boolean(),
  stats: z.object({
    leads: countSchema,
    // Nobody's replied yet.
    unattended: countSchema,
    contacted: countSchema,
    converted: countSchema,
  }),
  members: z.array(memberSchema),
});
export type TeamDetails = z.infer<typeof teamDetailsSchema>;

const teamResponse = z.object({ team: teamDetailsSchema });

export async function getTeam(id: string): Promise<TeamDetails> {
  const { team } = await mockApiRequest({
    method: 'GET',
    path: teamPath(id),
    response: teamResponse,
    mock: () => mockGetTeam(idSchema.parse(id)),
  });
  return team;
}

export const TEAM_NAME_MAX = 40;

const teamNameSchema = z.string().trim().min(1, 'Name the team').max(TEAM_NAME_MAX);

export const createTeamRequest = z.object({
  name: teamNameSchema,
  focus: z.enum(teamFocusSchema.options, { error: 'Pick what the team works on' }),
});
export type CreateTeamRequest = z.infer<typeof createTeamRequest>;

export async function createTeam(
  team: CreateTeamRequest,
  // One per tap on Create, reused if that tap is retried.
  idempotencyKey: string,
): Promise<TeamDetails> {
  const { team: created } = await mockApiRequest({
    method: 'POST',
    path: '/teams',
    request: createTeamRequest,
    body: team,
    response: teamResponse,
    idempotencyKey,
    mock: mockCreateTeam,
  });
  return created;
}

// Renaming a team or switching auto-assign; whatever's left out stays as it is.
export const updateTeamRequest = z.object({
  name: teamNameSchema.optional(),
  focus: teamFocusSchema.optional(),
  autoAssign: z.boolean().optional(),
});
export type UpdateTeamRequest = z.infer<typeof updateTeamRequest>;

export async function updateTeam(id: string, changes: UpdateTeamRequest): Promise<TeamDetails> {
  const { team } = await mockApiRequest({
    method: 'PATCH',
    path: teamPath(id),
    request: updateTeamRequest,
    body: changes,
    response: teamResponse,
    mock: (payload) => mockUpdateTeam(idSchema.parse(id), payload),
  });
  return team;
}

// Its members stay in the agency, just without this team.
export async function deleteTeam(id: string): Promise<void> {
  await mockApiRequest({
    method: 'DELETE',
    path: teamPath(id),
    response: okResponse,
    mock: () => mockDeleteTeam(idSchema.parse(id)),
  });
}

export async function removeFromTeam(teamId: string, memberId: string): Promise<TeamDetails> {
  const { team } = await mockApiRequest({
    method: 'DELETE',
    path: `${teamPath(teamId)}/members/${encodeURIComponent(idSchema.parse(memberId))}`,
    response: teamResponse,
    mock: () => mockRemoveFromTeam(idSchema.parse(teamId), idSchema.parse(memberId)),
  });
  return team;
}

// One member's leads within a team.

// "converted": running as a campaign. "UNKNOWN" only shows under the first chip.
export const teamLeadStatusSchema = tolerantEnum(['new', 'contacted', 'converted']);
export type TeamLeadStatus = z.infer<typeof teamLeadStatusSchema>;

const teamLeadSchema = z.object({
  id: idSchema,
  // The brand's contact person.
  name: z.string().min(1),
  company: z.string().min(1),
  dealType: z.enum(['paid', 'barter']).catch('paid'),
  status: teamLeadStatusSchema,
  // Rupees.
  budget: z.number().nonnegative().nullable(),
  // The teammate who owns the lead, e.g. "Leena Sharma".
  owner: z.string().min(1),
  phone: z.string().regex(PHONE_PATTERN).nullable(),
  email: z.email().nullable(),
});
export type TeamLead = z.infer<typeof teamLeadSchema>;

const memberLeadsResponse = z.object({
  team: teamSchema,
  member: memberSchema,
  leads: z.array(teamLeadSchema),
});
export type MemberLeads = z.infer<typeof memberLeadsResponse>;

export async function getMemberLeads(teamId: string, memberId: string): Promise<MemberLeads> {
  return mockApiRequest({
    method: 'GET',
    path: `${teamPath(teamId)}/members/${encodeURIComponent(idSchema.parse(memberId))}/leads`,
    response: memberLeadsResponse,
    mock: () => mockGetMemberLeads(idSchema.parse(teamId), idSchema.parse(memberId)),
  });
}

// The People overview.

const peopleResponse = z.object({
  overview: z.object({
    total: countSchema,
    active: countSchema,
    teams: countSchema,
    // Percent of working days attended this month.
    attendance: z.number().min(0).max(100),
    // Average first sign-in today, 24-hour "HH:MM".
    avgLogin: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  // Birthdays coming up, soonest first.
  birthdays: z.array(z.object({ id: idSchema, name: z.string().min(1), date: dateKeySchema })),
  // Each team with its first few members.
  teams: z.array(z.object({ team: teamSchema, members: z.array(memberSchema) })),
});
export type People = z.infer<typeof peopleResponse>;

export async function getPeople(): Promise<People> {
  return mockApiRequest({
    method: 'GET',
    path: '/people',
    response: peopleResponse,
    mock: mockGetPeople,
  });
}

const membersResponse = z.object({ members: z.array(memberSchema) });

export async function getMembers(): Promise<Member[]> {
  const { members } = await mockApiRequest({
    method: 'GET',
    path: '/members',
    response: membersResponse,
    mock: mockGetMembers,
  });
  return members;
}

// One member's details.

const permissionsSchema = z.object({
  // Hand leads and campaigns to teammates.
  assignLeads: z.boolean(),
  // Move a teammate's campaigns and leads to someone else.
  reallocate: z.boolean(),
  approveLeaves: z.boolean(),
});
export type Permissions = z.infer<typeof permissionsSchema>;

const memberDetailsSchema = memberSchema.extend({
  email: z.email().nullable(),
  phone: z.string().regex(PHONE_PATTERN).nullable(),
  joinedAt: dateKeySchema,
  birthDate: dateKeySchema.nullable(),
  employmentType: employmentTypeSchema,
  // e.g. "Aryan Yadav"; null for whoever's at the top.
  reportingManager: z.string().min(1).nullable(),
  // The team they're shown under; null if they're in none.
  team: teamSchema.nullable(),
  permissions: permissionsSchema,
});
export type MemberDetails = z.infer<typeof memberDetailsSchema>;

const memberResponse = z.object({ member: memberDetailsSchema });

export async function getMember(id: string): Promise<MemberDetails> {
  const { member } = await mockApiRequest({
    method: 'GET',
    path: memberPath(id),
    response: memberResponse,
    mock: () => mockGetMember(idSchema.parse(id)),
  });
  return member;
}

export async function updateMemberPermissions(
  id: string,
  permissions: Permissions,
): Promise<MemberDetails> {
  const { member } = await mockApiRequest({
    method: 'PUT',
    path: `${memberPath(id)}/permissions`,
    request: permissionsSchema,
    body: permissions,
    response: memberResponse,
    mock: (payload) => mockUpdateMemberPermissions(idSchema.parse(id), payload),
  });
  return member;
}

// Inviting someone, from the Add Member sheet. Request messages are what the sheet shows when
// the button is tapped too early, so they read as instructions.

export const MEMBER_NAME_MAX = 80;

export const addMemberRequest = z.object({
  name: z.string().trim().min(1, 'Add their name').max(MEMBER_NAME_MAX),
  // The invite goes here.
  email: z.email('Enter a valid email address').max(EMAIL_MAX),
  phone: z.string().regex(PHONE_PATTERN, 'Enter a valid contact number').nullable(),
  // What they can see in the app.
  role: z.enum(roleSchema.options, { error: 'Pick their permission' }),
  permissions: permissionsSchema,
  // The team they join; null to add them to the agency only.
  teamId: idSchema.nullable(),
});
export type AddMemberRequest = z.infer<typeof addMemberRequest>;

export async function addMember(
  member: AddMemberRequest,
  // One per tap on the sheet's button, reused if that tap is retried.
  idempotencyKey: string,
): Promise<Member> {
  const { member: added } = await mockApiRequest({
    method: 'POST',
    path: '/members',
    request: addMemberRequest,
    body: member,
    response: z.object({ member: memberSchema }),
    idempotencyKey,
    mock: mockAddMember,
  });
  return added;
}

// How the agency's creators are split between the team, for Assign Creators.

// A creator as Assign Creators lists them.
const assignableCreatorSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  // e.g. "@leenabliss".
  handle: z.string().min(1),
  avatarUrl: z.url().nullable(),
  // e.g. "Travel".
  niche: z.string().min(1),
});
export type AssignableCreator = z.infer<typeof assignableCreatorSchema>;

// A teammate with how many creators they're the POC of.
const assigneeSchema = memberSchema.extend({ creators: countSchema });
export type Assignee = z.infer<typeof assigneeSchema>;

const creatorAssignmentResponse = z.object({
  total: countSchema,
  // Looked after by a teammate.
  assigned: countSchema,
  unassigned: countSchema,
  // Assignments waiting on a manager's approval.
  pendingApprovals: countSchema,
  // Each team, the creators its members look after, and its members.
  teams: z.array(
    z.object({ team: teamSchema, creators: countSchema, members: z.array(assigneeSchema) }),
  ),
  // Creators nobody looks after yet, newest first.
  unassignedCreators: z.array(assignableCreatorSchema),
});
export type CreatorAssignment = z.infer<typeof creatorAssignmentResponse>;

export async function getCreatorAssignment(): Promise<CreatorAssignment> {
  return mockApiRequest({
    method: 'GET',
    path: '/creators/assignment',
    response: creatorAssignmentResponse,
    mock: mockGetCreatorAssignment,
  });
}

// Making a teammate the POC of some unassigned creators, from the Assign Creators sheet.
export const assignCreatorsRequest = z.object({
  creatorIds: z.array(idSchema).min(1, 'Pick at least one creator'),
  // Their POC.
  memberId: z.string({ error: 'Pick who looks after them' }).pipe(idSchema),
});
export type AssignCreatorsRequest = z.infer<typeof assignCreatorsRequest>;

export async function assignCreators(
  assignment: AssignCreatorsRequest,
): Promise<CreatorAssignment> {
  return mockApiRequest({
    method: 'POST',
    path: '/creators/assignment',
    request: assignCreatorsRequest,
    body: assignment,
    response: creatorAssignmentResponse,
    mock: mockAssignCreators,
  });
}

const memberCreatorsResponse = z.object({ creators: z.array(assignableCreatorSchema) });

// The creators a member is the POC of.
export async function getMemberCreators(id: string): Promise<AssignableCreator[]> {
  const { creators } = await mockApiRequest({
    method: 'GET',
    path: `${memberPath(id)}/creators`,
    response: memberCreatorsResponse,
    mock: () => mockGetMemberCreators(idSchema.parse(id)),
  });
  return creators;
}
