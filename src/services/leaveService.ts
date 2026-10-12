import { z } from 'zod';

import { mockApiRequest } from '@/dummy/mockApi';
import { mockApplyLeave, mockGetLeaves } from '@/dummy/leaves';
import { tolerantEnum } from '@/utils/schema';

// The signed-in member's leaves: what's left of each kind, what they've applied for, and
// applying for more.

// "YYYY-MM-DD".
const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const countSchema = z.number().int().nonnegative();

export const leaveTypeSchema = z.enum(['casual', 'paid']);
export type LeaveType = z.infer<typeof leaveTypeSchema>;

const leaveStatusSchema = tolerantEnum(['pending', 'approved', 'rejected']);
export type LeaveStatus = z.infer<typeof leaveStatusSchema>;

const leaveRequestSchema = z.object({
  id: z.string().min(1),
  type: tolerantEnum(leaveTypeSchema.options),
  from: dateKeySchema,
  to: dateKeySchema,
  days: z.number().int().positive(),
  reason: z.string().nullable(),
  status: leaveStatusSchema,
});
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;

const leavesResponse = z.object({
  // Days still free to apply for: pending requests are already taken off.
  balance: z.object({ casual: countSchema, paid: countSchema }),
  // Newest first.
  requests: z.array(leaveRequestSchema),
});
export type Leaves = z.infer<typeof leavesResponse>;

export async function getLeaves(): Promise<Leaves> {
  return mockApiRequest({
    method: 'GET',
    path: '/me/leaves',
    response: leavesResponse,
    mock: mockGetLeaves,
  });
}

// Applying, from the Apply for Leave sheet. Request messages are what the sheet shows when the
// button is tapped too early, so they read as instructions.

export const LEAVE_REASON_MAX = 200;

export const applyLeaveRequest = z
  .object({
    type: z.enum(leaveTypeSchema.options, { error: 'Pick the kind of leave' }),
    from: dateKeySchema,
    to: dateKeySchema,
    reason: z.string().trim().max(LEAVE_REASON_MAX).nullable(),
  })
  .refine((leave) => leave.to >= leave.from, { message: 'The last day can’t be before the first' });
export type ApplyLeaveRequest = z.infer<typeof applyLeaveRequest>;

export async function applyLeave(
  leave: ApplyLeaveRequest,
  // One per tap on Apply, reused if that tap is retried.
  idempotencyKey: string,
): Promise<Leaves> {
  return mockApiRequest({
    method: 'POST',
    path: '/me/leaves',
    request: applyLeaveRequest,
    body: leave,
    response: leavesResponse,
    idempotencyKey,
    mock: mockApplyLeave,
  });
}
