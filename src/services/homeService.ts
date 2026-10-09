import { z } from 'zod';

import { DUMMY_DELAY_MS } from '@/dummy/auth';
import { DUMMY_HOME } from '@/dummy/home';

// The home dashboard. Backed by src/dummy/ for now, parsed with the schemas apiRequest will use.
// One payload for every role: the home screen picks which sections to show.

const count = z.number().int().nonnegative();
const money = z.number().nonnegative();
const countTile = z.object({ count, caption: z.string() });
const moneyTile = z.object({ amount: money, caption: z.string() });

export const targetFrequencySchema = z.enum(['weekly', 'monthly', 'quarterly']);
export type TargetFrequency = z.infer<typeof targetFrequencySchema>;

export const teamPeriodSchema = z.enum(['day', 'week', 'month']);
export type TeamPeriod = z.infer<typeof teamPeriodSchema>;

const revenueSchema = z.object({
  achieved: money,
  target: money,
  frequency: targetFrequencySchema,
  changePercent: z.number(),
  daysLeft: count,
});
export type Revenue = z.infer<typeof revenueSchema>;

const reminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  due: z.string(),
  done: z.boolean(),
});
export type Reminder = z.infer<typeof reminderSchema>;

export const homeDashboardSchema = z.object({
  pendingLeads: count,
  leadMatrix: z.object({
    unattended: countTile,
    newLeads: countTile,
    contacted: countTile,
    won: countTile,
  }),
  team: z.object({
    total: count,
    groups: z.array(
      z.object({
        name: z.string(),
        members: count,
        active: count,
        absent: count,
        workload: z.record(teamPeriodSchema, z.array(z.string())),
      }),
    ),
  }),
  performance: z.object({ thisMonth: moneyTile, lastMonth: moneyTile }),
  revenue: revenueSchema,
  topCreators: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      niche: z.string(),
      avatarUrl: z.url(),
      revenue: money,
    }),
  ),
  liveCampaigns: z.array(
    z.object({
      id: z.string(),
      brand: z.string(),
      stage: z.string(),
      title: z.string(),
      progress: z.number().min(0).max(100),
      budget: money,
      deadline: z.string(),
    }),
  ),
  reminders: z.array(reminderSchema),
  activity: z.array(
    z.object({ id: z.string(), title: z.string(), body: z.string(), at: z.iso.datetime() }),
  ),
});
export type HomeDashboard = z.infer<typeof homeDashboardSchema>;

export const setRevenueTargetRequestSchema = z.object({
  target: z.number().positive(),
  frequency: targetFrequencySchema,
});
export type SetRevenueTargetRequest = z.infer<typeof setRevenueTargetRequestSchema>;

export const toggleReminderRequestSchema = z.object({ id: z.string(), done: z.boolean() });
export type ToggleReminderRequest = z.infer<typeof toggleReminderRequestSchema>;

const wait = (ms = DUMMY_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getHomeDashboard(): Promise<HomeDashboard> {
  await wait();
  return homeDashboardSchema.parse(DUMMY_HOME);
}

export async function setRevenueTarget(body: SetRevenueTargetRequest): Promise<Revenue> {
  const request = setRevenueTargetRequestSchema.parse(body);
  await wait();
  return revenueSchema.parse({ ...DUMMY_HOME.revenue, ...request });
}

export async function toggleReminder(body: ToggleReminderRequest): Promise<Reminder> {
  const { id, done } = toggleReminderRequestSchema.parse(body);
  await wait(300);
  const reminder = DUMMY_HOME.reminders.find((r) => r.id === id);
  return reminderSchema.parse({ ...reminder, done });
}
