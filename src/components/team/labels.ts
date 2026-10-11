import type { Role } from '@/services/authService';
import type { AssignAs, Gender } from '@/services/profileService';
import type {
  EmploymentType,
  MemberStatus,
  Permissions,
  TeamFocus,
  TeamLeadStatus,
} from '@/services/teamService';
import type { UNKNOWN } from '@/utils/schema';

// Display copy and tints for the team and profile screens.

interface FocusStyle {
  label: string;
  // The team icon's circle.
  gradient: string;
  border: string;
  color: string;
  // The team overview card's wash, so each kind of team reads at a glance.
  wash: string;
}

export const FOCUS_STYLES: Record<TeamFocus | typeof UNKNOWN, FocusStyle> = {
  sales: {
    label: 'Sales',
    gradient: 'linear-gradient(135deg, rgba(225, 94, 68, 0.28) 0%, rgba(225, 94, 68, 0.23) 100%)',
    border: 'rgba(255, 181, 160, 0.3)',
    color: '#E15E44',
    wash: 'rgba(255, 255, 255, 0.6)',
  },
  operations: {
    label: 'Operations',
    gradient: 'linear-gradient(135deg, #C7D2FE 0%, #E0E7FF 100%)',
    border: 'rgba(160, 170, 255, 0.3)',
    color: '#4F39F6',
    wash: 'rgba(224, 231, 255, 0.55)',
  },
  mixed: {
    label: 'Sales + Operations',
    gradient: 'linear-gradient(135deg, rgba(222, 255, 200, 0.8) 0%, #E4F7DB 100%)',
    border: '#D0FFB7',
    color: '#79CB4C',
    wash: 'rgba(228, 247, 219, 0.55)',
  },
  UNKNOWN: {
    label: 'Team',
    gradient: 'linear-gradient(135deg, rgba(200, 210, 255, 0.8) 0%, rgba(220, 205, 255, 0.8) 100%)',
    border: 'rgba(160, 170, 255, 0.3)',
    color: '#5560CC',
    wash: 'rgba(255, 255, 255, 0.6)',
  },
};

export const FOCUS_OPTIONS: { value: TeamFocus; label: string }[] = [
  { value: 'sales', label: 'Sales' },
  { value: 'operations', label: 'Operations' },
  { value: 'mixed', label: 'Both' },
];

export const MEMBER_STATUS_STYLES: Record<
  MemberStatus,
  { label: string; background: string; border: string; dot: string; text: string }
> = {
  active: {
    label: 'Active',
    background: 'rgba(240, 253, 244, 0.6)',
    border: '#7BF1A8',
    dot: '#05DF72',
    text: '#00A63E',
  },
  invited: {
    label: 'Invite Sent',
    background: '#E5ECFF',
    border: '#6990FD',
    dot: '#1D4ED8',
    text: '#1D4ED8',
  },
  offline: {
    label: 'Offline',
    background: 'rgba(241, 245, 249, 0.4)',
    border: '#E2E8F0',
    dot: '#D1D5DC',
    text: '#64748B',
  },
  UNKNOWN: {
    label: 'Other',
    background: '#F4F1EC',
    border: '#E8E2D9',
    dot: '#8C8A84',
    text: '#8C8A84',
  },
};

export const ROLE_LABELS: Record<Role | typeof UNKNOWN, string> = {
  admin: 'Admin',
  sales: 'Sales',
  operations: 'Operations',
  UNKNOWN: 'Member',
};

export const ASSIGN_AS_LABELS: Record<AssignAs | typeof UNKNOWN, string> = {
  manager: 'Manager',
  lead: 'Team Lead',
  executive: 'Executive',
  UNKNOWN: 'Member',
};

export const GENDER_LABELS: Record<Gender | typeof UNKNOWN, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
  UNKNOWN: 'Other',
};

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  intern: 'Intern',
  UNKNOWN: 'Other',
};

export const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  assignLeads: 'Assign Leads / Campaigns',
  reallocate: 'Reallocate Campaigns & Leads',
  approveLeaves: 'Approve Leaves',
};
export const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as (keyof Permissions)[];

// A member's leads within a team: sales filter by where the lead stands, the others by whether
// it's running as a campaign. `status` null is "everything".
export type LeadChip = { status: TeamLeadStatus | null; label: string };

export const LEAD_CHIPS: Record<TeamFocus | typeof UNKNOWN, LeadChip[]> = {
  sales: [
    { status: null, label: 'Leads' },
    { status: 'new', label: 'New' },
    { status: 'contacted', label: 'Contacted' },
  ],
  operations: [
    { status: null, label: 'All Campaign' },
    { status: 'converted', label: 'Campaign' },
  ],
  mixed: [
    { status: null, label: 'All Campaign' },
    { status: 'converted', label: 'Campaign' },
  ],
  UNKNOWN: [{ status: null, label: 'Leads' }],
};

// Chip tints for a lead's status, after the leads screens'.
export const LEAD_STATUS_STYLES: Record<
  TeamLeadStatus,
  { label: string; background: string; border: string; text: string; dot: string }
> = {
  new: {
    label: 'New',
    background: 'rgba(255, 251, 235, 0.6)',
    border: '#FFD230',
    text: '#BB4D00',
    dot: '#FFB900',
  },
  contacted: {
    label: 'Contacted',
    background: 'rgba(239, 246, 255, 0.5)',
    border: '#8EC5FF',
    text: '#1447E6',
    dot: '#3A7DE8',
  },
  converted: {
    label: 'Converted',
    background: 'rgba(240, 253, 244, 0.6)',
    border: '#7BF1A8',
    text: '#008236',
    dot: '#05DF72',
  },
  UNKNOWN: {
    label: 'Other',
    background: '#F4F1EC',
    border: '#E8E2D9',
    text: '#8C8A84',
    dot: '#8C8A84',
  },
};

// Lead cards take these in turn, each with its deal chip in the same hue.
const LEAD_TINTS = [
  {
    card: 'rgba(209, 250, 229, 0.4)',
    chip: 'rgba(240, 253, 244, 0.5)',
    border: '#7BF1A8',
    text: '#008236',
  },
  {
    card: 'rgba(224, 231, 255, 0.5)',
    chip: 'rgba(238, 242, 255, 0.5)',
    border: '#A3B3FF',
    text: '#432DD7',
  },
  {
    card: 'rgba(219, 234, 254, 0.4)',
    chip: 'rgba(240, 249, 255, 0.5)',
    border: '#74D4FF',
    text: '#0069A8',
  },
  {
    card: 'rgba(252, 231, 243, 0.4)',
    chip: 'rgba(253, 242, 248, 0.5)',
    border: '#FDA5D5',
    text: '#C6005C',
  },
];
export const leadTint = (index: number) => LEAD_TINTS[index % LEAD_TINTS.length] ?? LEAD_TINTS[0]!;

export const pluralMembers = (count: number) => `${count} ${count === 1 ? 'Member' : 'Members'}`;
