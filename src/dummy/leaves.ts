import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the leaves screen. Delete with the folder.
//
// Held in memory only: applied leaves are gone after a restart. A request's days come off the
// balance as soon as it's applied for, so the balance is always what's left to apply for.

type MockLeaveType = 'casual' | 'paid';

interface MockLeave {
  id: string;
  type: MockLeaveType;
  from: string;
  to: string;
  days: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

const BALANCE: Record<MockLeaveType, number> = { casual: 2, paid: 6 };

const REQUESTS: MockLeave[] = [
  {
    id: 'leave_1',
    type: 'paid',
    from: '2026-09-15',
    to: '2026-09-16',
    days: 2,
    reason: 'Family function',
    status: 'approved',
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

// Both days count: the 3rd to the 4th is two days.
function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1;
}

const overlaps = (a: { from: string; to: string }, b: { from: string; to: string }) =>
  a.from <= b.to && b.from <= a.to;

function snapshot() {
  return { balance: { ...BALANCE }, requests: REQUESTS.map((r) => ({ ...r })) };
}

// GET /me/leaves
export function mockGetLeaves() {
  return snapshot();
}

// POST /me/leaves
export function mockApplyLeave(
  payload: { type: MockLeaveType; from: string; to: string; reason: string | null } | undefined,
) {
  if (!payload) throw new ApiError('Invalid leave', 400, { message: 'Invalid leave' });
  const days = daysBetween(payload.from, payload.to);
  if (days > BALANCE[payload.type]) {
    throw new ApiError('Not enough leave', 409, {
      message: 'Not enough leave',
      code: 'insufficient_balance',
    });
  }
  if (REQUESTS.some((r) => r.status !== 'rejected' && overlaps(r, payload))) {
    throw new ApiError('Overlapping leave', 409, {
      message: 'Overlapping leave',
      code: 'overlapping_leave',
    });
  }
  BALANCE[payload.type] -= days;
  REQUESTS.unshift({
    id: `leave_${Date.now()}`,
    ...payload,
    reason: payload.reason || null,
    days,
    status: 'pending',
  });
  return snapshot();
}
