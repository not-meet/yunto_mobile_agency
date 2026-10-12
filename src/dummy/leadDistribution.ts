import { mockGetMembers } from '@/dummy/team';
import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the lead distribution screen. Delete with the folder.
//
// Held in memory only: saved preferences are gone after a restart. Leads go to the sales
// members who've joined; anyone new joins the end of the line.

type MockMode = 'random' | 'broadcast' | 'round-robin';

let MODE: MockMode = 'round-robin';
let ORDER: string[] = ['sanjay', 'riya', 'lisa'];

function eligible() {
  return mockGetMembers().members.filter(
    (m) => m.status !== 'invited' && (m.role === 'sales' || ORDER.includes(m.id)),
  );
}

function snapshot() {
  const members = eligible();
  const rank = (id: string) => {
    const at = ORDER.indexOf(id);
    return at < 0 ? ORDER.length : at;
  };
  return {
    mode: MODE,
    members: [...members]
      .sort((a, b) => rank(a.id) - rank(b.id))
      .map(({ id, name }) => ({ id, name })),
  };
}

// GET /lead-distribution
export function mockGetLeadDistribution() {
  return snapshot();
}

// PUT /lead-distribution. The order has to name everyone leads go to, once each.
export function mockUpdateLeadDistribution(
  payload: { mode: MockMode; order: string[] } | undefined,
) {
  if (!payload) throw new ApiError('Invalid preferences', 400, { message: 'Invalid preferences' });
  const ids = eligible().map((m) => m.id);
  const sameMembers =
    payload.order.length === ids.length && ids.every((id) => payload.order.includes(id));
  if (!sameMembers) {
    throw new ApiError('Team changed', 409, { message: 'Team changed', code: 'members_changed' });
  }
  MODE = payload.mode;
  ORDER = [...payload.order];
  return snapshot();
}
