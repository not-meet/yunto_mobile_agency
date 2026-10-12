import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the team screens. Delete with the folder.
//
// Held in memory only: new teams, invites, renames and permission changes are gone after a
// restart. A member's leads are dealt from a small pool, so the numbers look plausible.

const avatar = (seed: string) => `https://picsum.photos/seed/yunto-team-${seed}/96/96`;

type MockRole = 'admin' | 'sales' | 'operations';
type MockFocus = 'sales' | 'operations' | 'mixed';
type MockStatus = 'active' | 'invited' | 'offline';
type MockAssignAs = 'manager' | 'lead' | 'executive';
type MockLeadStatus = 'new' | 'contacted' | 'converted';

interface MockPermissions {
  assignLeads: boolean;
  reallocate: boolean;
  approveLeaves: boolean;
}

interface MockMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: MockRole;
  assignAs: MockAssignAs;
  status: MockStatus;
  phone: string | null;
  joinedAt: string;
  birthDate: string | null;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  permissions: MockPermissions;
}

interface MockTeam {
  id: string;
  name: string;
  focus: MockFocus;
  autoAssign: boolean;
  memberIds: string[];
}

const ALL_ON: MockPermissions = { assignLeads: true, reallocate: true, approveLeaves: true };
const LEADS_ONLY: MockPermissions = { assignLeads: true, reallocate: false, approveLeaves: false };
const NONE: MockPermissions = { assignLeads: false, reallocate: false, approveLeaves: false };

// Everyone reports to them.
const HEAD_ID = 'aryan';

const MEMBERS: MockMember[] = [
  {
    id: 'aryan',
    name: 'Aryan Yadav',
    avatarUrl: avatar('aryan'),
    role: 'admin',
    assignAs: 'manager',
    status: 'active',
    phone: '+919810012345',
    joinedAt: '2023-04-03',
    birthDate: '1990-11-12',
    employmentType: 'full-time',
    permissions: ALL_ON,
  },
  {
    id: 'vishal',
    name: 'Vishal Sharma',
    avatarUrl: avatar('vishal'),
    role: 'operations',
    assignAs: 'manager',
    status: 'active',
    phone: '+918886543210',
    joinedAt: '2025-02-07',
    birthDate: '1998-05-22',
    employmentType: 'full-time',
    permissions: ALL_ON,
  },
  {
    id: 'priya',
    name: 'Priya Mehta',
    avatarUrl: avatar('priya'),
    role: 'operations',
    assignAs: 'lead',
    status: 'active',
    phone: '+919822001122',
    joinedAt: '2024-08-19',
    birthDate: '1996-02-14',
    employmentType: 'full-time',
    permissions: LEADS_ONLY,
  },
  {
    id: 'arun',
    name: 'Arun Nair',
    avatarUrl: avatar('arun'),
    role: 'operations',
    assignAs: 'manager',
    status: 'offline',
    phone: '+919833112233',
    joinedAt: '2024-01-15',
    birthDate: '1993-07-30',
    employmentType: 'full-time',
    permissions: LEADS_ONLY,
  },
  {
    id: 'riya',
    name: 'Riya Verma',
    avatarUrl: avatar('riya'),
    role: 'operations',
    assignAs: 'executive',
    status: 'active',
    phone: '+919844223344',
    joinedAt: '2025-06-02',
    birthDate: '2000-03-18',
    employmentType: 'full-time',
    permissions: NONE,
  },
  {
    id: 'karan',
    name: 'Karan Malhotra',
    avatarUrl: null,
    role: 'operations',
    assignAs: 'executive',
    status: 'active',
    phone: null,
    joinedAt: '2025-09-10',
    birthDate: null,
    employmentType: 'intern',
    permissions: NONE,
  },
  {
    id: 'sanjay',
    name: 'Sanjay Sharma',
    avatarUrl: avatar('sanjay'),
    role: 'sales',
    assignAs: 'lead',
    status: 'active',
    phone: '+919855334455',
    joinedAt: '2024-05-27',
    birthDate: '1995-12-04',
    employmentType: 'full-time',
    permissions: LEADS_ONLY,
  },
  {
    id: 'lisa',
    name: 'Lisa Rai',
    avatarUrl: avatar('lisa'),
    role: 'sales',
    assignAs: 'executive',
    status: 'active',
    phone: '+919866445566',
    joinedAt: '2025-03-11',
    birthDate: '1999-08-09',
    employmentType: 'full-time',
    permissions: NONE,
  },
  {
    id: 'rahul',
    name: 'Rahul Singh',
    avatarUrl: avatar('rahul'),
    role: 'sales',
    assignAs: 'executive',
    status: 'active',
    phone: '+919877556677',
    joinedAt: '2024-11-20',
    birthDate: '1997-10-16',
    employmentType: 'full-time',
    permissions: NONE,
  },
  {
    id: 'parul',
    name: 'Parul Singh',
    avatarUrl: avatar('parul'),
    role: 'sales',
    assignAs: 'executive',
    status: 'active',
    phone: '+919888667788',
    joinedAt: '2025-07-01',
    birthDate: '2001-10-24',
    employmentType: 'part-time',
    permissions: NONE,
  },
  {
    id: 'sonal',
    name: 'Sonal Soni',
    avatarUrl: avatar('sonal'),
    role: 'sales',
    assignAs: 'executive',
    status: 'offline',
    phone: '+919899778899',
    joinedAt: '2025-01-06',
    birthDate: '1998-01-27',
    employmentType: 'contract',
    permissions: NONE,
  },
  {
    id: 'neha',
    name: 'Neha Kapoor',
    avatarUrl: null,
    role: 'sales',
    assignAs: 'executive',
    status: 'invited',
    phone: null,
    joinedAt: '2026-10-08',
    birthDate: null,
    employmentType: 'full-time',
    permissions: NONE,
  },
];

const TEAMS: MockTeam[] = [
  {
    id: 'operations',
    name: 'Operations',
    focus: 'operations',
    autoAssign: false,
    memberIds: ['vishal', 'priya', 'arun', 'riya', 'karan'],
  },
  {
    id: 'sales',
    name: 'Sales',
    focus: 'sales',
    autoAssign: true,
    memberIds: ['sanjay', 'lisa', 'rahul', 'parul', 'sonal', 'neha'],
  },
  {
    id: 'sales-ops',
    name: 'Sales + Operations',
    focus: 'mixed',
    autoAssign: false,
    memberIds: ['riya', 'sanjay', 'vishal'],
  },
];

const LEAD_POOL: {
  name: string;
  company: string;
  dealType: 'paid' | 'barter';
  status: 'new' | 'contacted';
  budget: number | null;
  owner: string;
  phone: string | null;
}[] = [
  {
    name: 'Priya Sharma',
    company: 'Zostel Trip',
    dealType: 'barter',
    status: 'new',
    budget: 120_000,
    owner: 'Leena Sharma',
    phone: '+919811002233',
  },
  {
    name: 'Aditya Mehta',
    company: 'FabHotels',
    dealType: 'barter',
    status: 'contacted',
    budget: 250_000,
    owner: 'Rahul Verma',
    phone: '+919811223344',
  },
  {
    name: 'Nisha Kapoor',
    company: 'Urban Company',
    dealType: 'paid',
    status: 'new',
    budget: 80_000,
    owner: 'Sonal Roy',
    phone: null,
  },
  {
    name: 'Ravi Gupta',
    company: 'Nykaa Fashion',
    dealType: 'paid',
    status: 'contacted',
    budget: 360_000,
    owner: 'Leena Sharma',
    phone: '+919811334455',
  },
  {
    name: 'Kavya Iyer',
    company: 'Mamaearth',
    dealType: 'paid',
    status: 'contacted',
    budget: 150_000,
    owner: 'Rahul Verma',
    phone: '+919811445566',
  },
  {
    name: 'Arjun Bose',
    company: 'boAt',
    dealType: 'barter',
    status: 'new',
    budget: null,
    owner: 'Sonal Roy',
    phone: '+919811556677',
  },
];

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '.');

function findTeam(id: string): MockTeam {
  const team = TEAMS.find((t) => t.id === id);
  if (!team) throw new ApiError('Team not found', 404, { message: 'Team not found' });
  return team;
}

function findMember(id: string): MockMember {
  const member = MEMBERS.find((m) => m.id === id);
  if (!member) throw new ApiError('Member not found', 404, { message: 'Member not found' });
  return member;
}

function toMember(member: MockMember) {
  const { id, name, avatarUrl, role, assignAs, status } = member;
  return { id, name, avatarUrl, role, assignAs, status };
}

const membersOf = (team: MockTeam) => team.memberIds.map(findMember);

function toTeam(team: MockTeam) {
  const members = membersOf(team);
  return {
    id: team.id,
    name: team.name,
    focus: team.focus,
    members: members.length,
    active: members.filter((m) => m.status === 'active').length,
  };
}

// Dealt from the pool by where the member sits on the team, so each gets a different handful.
// Operations work leads already running as campaigns, so most of theirs are converted.
function leadsFor(team: MockTeam, memberId: string) {
  const seat = team.memberIds.indexOf(memberId);
  if (seat < 0) return [];
  const count = 3 + (seat % 2);
  return Array.from({ length: count }, (_, i) => {
    const lead = LEAD_POOL[(seat + i) % LEAD_POOL.length]!;
    const status: MockLeadStatus =
      team.focus !== 'sales' && i % 3 !== 2 ? 'converted' : lead.status;
    return {
      id: `${team.id}-${memberId}-${i}`,
      name: lead.name,
      company: lead.company,
      dealType: lead.dealType,
      status,
      budget: lead.budget,
      owner: lead.owner,
      phone: lead.phone,
      email: `${slug(lead.name)}@${slug(lead.company)}.com`,
    };
  });
}

function toTeamDetails(team: MockTeam) {
  const leads = team.memberIds.flatMap((id) => leadsFor(team, id));
  const count = (status: MockLeadStatus) => leads.filter((l) => l.status === status).length;
  return {
    ...toTeam(team),
    autoAssign: team.autoAssign,
    stats: {
      leads: leads.length,
      unattended: count('new'),
      contacted: count('contacted'),
      converted: count('converted'),
    },
    members: membersOf(team).map(toMember),
  };
}

// For the profile summary.
export const mockTeamCount = () => TEAMS.length;

// GET /teams
export function mockGetTeams() {
  return { teams: TEAMS.map(toTeam) };
}

// GET /teams/:id
export function mockGetTeam(id: string) {
  return { team: toTeamDetails(findTeam(id)) };
}

// POST /teams
export function mockCreateTeam(payload: { name: string; focus: MockFocus } | undefined) {
  if (!payload) throw new ApiError('Invalid team', 400, { message: 'Invalid team' });
  const team: MockTeam = {
    id: `team_${Date.now()}`,
    name: payload.name,
    focus: payload.focus,
    autoAssign: false,
    memberIds: [],
  };
  TEAMS.push(team);
  return { team: toTeamDetails(team) };
}

// PATCH /teams/:id
export function mockUpdateTeam(
  id: string,
  payload: { name?: string; focus?: MockFocus; autoAssign?: boolean } | undefined,
) {
  const team = findTeam(id);
  if (payload?.name !== undefined) team.name = payload.name;
  if (payload?.focus !== undefined) team.focus = payload.focus;
  if (payload?.autoAssign !== undefined) team.autoAssign = payload.autoAssign;
  return { team: toTeamDetails(team) };
}

// DELETE /teams/:id
export function mockDeleteTeam(id: string) {
  TEAMS.splice(TEAMS.indexOf(findTeam(id)), 1);
  return { ok: true as const };
}

// DELETE /teams/:id/members/:memberId
export function mockRemoveFromTeam(teamId: string, memberId: string) {
  const team = findTeam(teamId);
  team.memberIds = team.memberIds.filter((id) => id !== memberId);
  return { team: toTeamDetails(team) };
}

// GET /teams/:id/members/:memberId/leads
export function mockGetMemberLeads(teamId: string, memberId: string) {
  const team = findTeam(teamId);
  const member = findMember(memberId);
  return { team: toTeam(team), member: toMember(member), leads: leadsFor(team, memberId) };
}

// Days until the next one, counting today as 0.
function daysUntilBirthday(birthDate: string, today = new Date()) {
  const [, month = 1, day = 1] = birthDate.split('-').map(Number);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const next = new Date(today.getFullYear(), month - 1, day);
  if (next < start) next.setFullYear(next.getFullYear() + 1);
  return Math.round((next.getTime() - start.getTime()) / 86_400_000);
}

function nextBirthday(birthDate: string, today = new Date()) {
  const next = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  next.setDate(next.getDate() + daysUntilBirthday(birthDate, today));
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${next.getFullYear()}-${month}-${day}`;
}

const PEOPLE_PREVIEW = 3;

// GET /people
export function mockGetPeople() {
  const birthdays = MEMBERS.flatMap((m) => (m.birthDate ? [{ ...m, birthDate: m.birthDate }] : []))
    .sort((a, b) => daysUntilBirthday(a.birthDate) - daysUntilBirthday(b.birthDate))
    .slice(0, 2)
    .map((m) => ({ id: m.id, name: m.name, date: nextBirthday(m.birthDate) }));

  return {
    overview: {
      total: MEMBERS.length,
      active: MEMBERS.filter((m) => m.status === 'active').length,
      teams: TEAMS.length,
      attendance: 92,
      avgLogin: '10:15',
    },
    birthdays,
    teams: TEAMS.map((team) => ({
      team: toTeam(team),
      members: membersOf(team).slice(0, PEOPLE_PREVIEW).map(toMember),
    })),
  };
}

// GET /members
export function mockGetMembers() {
  return { members: MEMBERS.map(toMember) };
}

function toMemberDetails(member: MockMember) {
  const team = TEAMS.find((t) => t.memberIds.includes(member.id));
  return {
    ...toMember(member),
    email: `${member.name.split(' ')[0]?.toLowerCase() ?? member.id}@stellaragency.com`,
    phone: member.phone,
    joinedAt: member.joinedAt,
    birthDate: member.birthDate,
    employmentType: member.employmentType,
    reportingManager: member.id === HEAD_ID ? null : findMember(HEAD_ID).name,
    team: team ? toTeam(team) : null,
    permissions: member.permissions,
  };
}

// GET /members/:id
export function mockGetMember(id: string) {
  return { member: toMemberDetails(findMember(id)) };
}

// PUT /members/:id/permissions
export function mockUpdateMemberPermissions(id: string, payload: MockPermissions | undefined) {
  if (!payload) throw new ApiError('Invalid permissions', 400, { message: 'Invalid permissions' });
  const member = findMember(id);
  member.permissions = payload;
  return { member: toMemberDetails(member) };
}

// POST /members. They're invited, at the top of the list, and on the team if one was given.
export function mockAddMember(
  payload:
    | {
        name: string;
        email: string;
        phone: string | null;
        role: MockRole;
        permissions: MockPermissions;
        teamId: string | null;
      }
    | undefined,
) {
  if (!payload) throw new ApiError('Invalid member', 400, { message: 'Invalid member' });
  const team = payload.teamId === null ? null : findTeam(payload.teamId);
  const member: MockMember = {
    id: `member_${Date.now()}`,
    name: payload.name,
    avatarUrl: null,
    role: payload.role,
    assignAs: 'executive',
    status: 'invited',
    phone: payload.phone,
    joinedAt: new Date().toISOString().slice(0, 10),
    birthDate: null,
    employmentType: 'full-time',
    permissions: payload.permissions,
  };
  MEMBERS.unshift(member);
  team?.memberIds.push(member.id);
  return { member: toMember(member) };
}

// GET /creators/assignment. Adds up to the profile's 24 creators.
export function mockGetCreatorAssignment() {
  return { total: 24, assigned: 18, unassigned: 6, pendingApprovals: 3 };
}
