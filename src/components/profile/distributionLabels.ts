import { ASSIGN_AS_LABELS, ROLE_LABELS } from '@/components/team/labels';
import type {
  DistributionChannel,
  DistributionMember,
  DistributionMode,
} from '@/services/leadDistributionService';
import type { AssignAs } from '@/services/profileService';
import type { UNKNOWN } from '@/utils/schema';

// Copy and tints for the lead distribution screen, worded for leads or campaigns.

export const CHANNEL_OPTIONS: { key: DistributionChannel; label: string }[] = [
  { key: 'leads', label: 'Leads' },
  { key: 'campaigns', label: 'Campaigns' },
];

// "lead" / "leads", in the copy below.
export const CHANNEL_NOUNS: Record<DistributionChannel, { one: string; many: string }> = {
  leads: { one: 'lead', many: 'leads' },
  campaigns: { one: 'campaign', many: 'campaigns' },
};

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function modeCopy(mode: DistributionMode, many: string) {
  switch (mode) {
    case 'random':
      return {
        label: 'Random',
        description: `Distributes ${many} to any available person randomly.`,
      };
    case 'broadcast':
      return {
        label: 'All (Broadcast)',
        description: `Send ${many} to all team members. First to respond gets it.`,
      };
    case 'round-robin':
      return {
        label: 'Round by Round',
        description: `Distributes ${many} one-by-one in a loop among team members.`,
      };
  }
}

// "Sales · Team Lead", under a name in the pickers.
export const memberSubtitle = (member: DistributionMember) =>
  `${ROLE_LABELS[member.role]} · ${ASSIGN_AS_LABELS[member.assignAs]}`;

export const firstName = (name: string) => name.split(/\s+/)[0] ?? name;

// The small uppercase chip after a name.
export const ASSIGN_AS_TINTS: Record<
  AssignAs | typeof UNKNOWN,
  { background: string; text: string }
> = {
  manager: { background: '#ECEAFE', text: '#5546D8' },
  lead: { background: '#E4F4EA', text: '#2E7A4E' },
  executive: { background: '#F3EEE6', text: '#8A6B45' },
  UNKNOWN: { background: '#F1EFEA', text: '#7A756C' },
};

const INITIAL_TINTS = [
  { background: '#CEECD8', text: '#246A42' },
  { background: '#FCE6EC', text: '#AC335A' },
  { background: '#F8E3D2', text: '#975824' },
  { background: '#E0DBFD', text: '#5546D8' },
  { background: '#FCE4F3', text: '#A73787' },
  { background: '#E5E5FE', text: '#6159E5' },
];

// The same person gets the same tint everywhere on the screen.
export function initialTint(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return INITIAL_TINTS[Math.abs(hash) % INITIAL_TINTS.length] ?? INITIAL_TINTS[0]!;
}
