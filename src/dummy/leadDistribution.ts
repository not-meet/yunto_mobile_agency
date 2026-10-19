import { mockGetMembers } from '@/dummy/team';
import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the lead distribution screen. Delete with the folder.
//
// Held in memory only: saved preferences are gone after a restart. Anyone who's joined can be
// in a sequence or be a priority recipient.

type MockMode = 'random' | 'broadcast' | 'round-robin';
type MockChannel = 'leads' | 'campaigns';

interface MockSettings {
  mode: MockMode;
  sequence: string[];
  priority: string[];
}

const SETTINGS: Record<MockChannel, MockSettings> = {
  leads: {
    mode: 'round-robin',
    sequence: ['sanjay', 'rahul', 'lisa'],
    priority: ['aryan', 'vishal'],
  },
  campaigns: { mode: 'round-robin', sequence: ['riya', 'priya', 'karan'], priority: [] },
};

function eligible() {
  return mockGetMembers().members.filter((m) => m.status !== 'invited');
}

const copy = (settings: MockSettings): MockSettings => ({
  mode: settings.mode,
  sequence: [...settings.sequence],
  priority: [...settings.priority],
});

function snapshot() {
  return {
    leads: copy(SETTINGS.leads),
    campaigns: copy(SETTINGS.campaigns),
    members: eligible().map(({ id, name, role, assignAs }) => ({ id, name, role, assignAs })),
  };
}

// GET /lead-distribution
export function mockGetLeadDistribution() {
  return snapshot();
}

// PUT /lead-distribution/:channel. Everyone named has to still be on the team.
export function mockUpdateLeadDistribution(
  channel: MockChannel,
  payload: MockSettings | undefined,
) {
  if (!payload) throw new ApiError('Invalid preferences', 400, { message: 'Invalid preferences' });
  const ids = new Set(eligible().map((m) => m.id));
  if (![...payload.sequence, ...payload.priority].every((id) => ids.has(id))) {
    throw new ApiError('Team changed', 409, { message: 'Team changed', code: 'members_changed' });
  }
  SETTINGS[channel] = copy(payload);
  return snapshot();
}
