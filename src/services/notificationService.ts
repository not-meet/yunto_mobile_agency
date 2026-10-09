import { z } from 'zod';

import { mockDismissAttention, mockGetNotifications, mockReadNotification } from '@/dummy/inbox';
import { mockApiRequest } from '@/dummy/mockApi';
import { tolerantEnum } from '@/utils/schema';

// The notifications screen: things that need the creator's attention, then the feed by day.

// What an attention card is about; sets its hue, icon and where tapping it goes. "UNKNOWN" for
// anything else: a neutral card that opens nothing.
export const attentionKindSchema = tolerantEnum(['leads', 'deadline', 'payment', 'review']);
export type AttentionKind = z.infer<typeof attentionKindSchema>;

// What tapping opens: a campaign (its id) and the piece a review is about. Optional, so
// fixtures without it still parse.
const targetSchema = z
  .object({ campaignId: z.string().min(1), deliverableId: z.string().min(1).nullable() })
  .nullish();
export type NotificationTarget = z.infer<typeof targetSchema>;

const attentionItemSchema = z.object({
  id: z.string().min(1),
  kind: attentionKindSchema,
  // Server-written, e.g. "3 leads need response" / "Urban Tech SS24".
  title: z.string().min(1),
  // null when there's nothing to add; the line is left out.
  subtitle: z.string().min(1).nullable(),
  target: targetSchema,
});
export type AttentionItem = z.infer<typeof attentionItemSchema>;

// "UNKNOWN" for anything else: a neutral icon, only under the "All" filter. "review": the brand
// approved a deliverable or asked for changes.
export const notificationKindSchema = tolerantEnum([
  'offer',
  'lead',
  'campaign',
  'payment',
  'review',
]);
export type NotificationKind = z.infer<typeof notificationKindSchema>;

const notificationSchema = z.object({
  id: z.string().min(1),
  kind: notificationKindSchema,
  title: z.string().min(1),
  // null when there's nothing to add; the line is left out.
  subtitle: z.string().min(1).nullable(),
  createdAt: z.iso.datetime(),
  read: z.boolean(),
  target: targetSchema,
});
export type AppNotification = z.infer<typeof notificationSchema>;

const notificationsSchema = z.object({
  attention: z.array(attentionItemSchema),
  // Newest first.
  notifications: z.array(notificationSchema),
});
export type Notifications = z.infer<typeof notificationsSchema>;

// TODO(notifications): take a cursor and return the next one once the API paginates.
export function getNotifications(): Promise<Notifications> {
  return mockApiRequest({
    method: 'GET',
    path: '/notifications',
    response: notificationsSchema,
    mock: mockGetNotifications,
  });
}

const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);
const okResponse = z.object({ ok: z.literal(true) });

export async function dismissAttention(id: string): Promise<void> {
  const safeId = idSchema.parse(id);
  await mockApiRequest({
    method: 'POST',
    path: `/notifications/attention/${encodeURIComponent(safeId)}/dismiss`,
    response: okResponse,
    mock: () => mockDismissAttention(safeId),
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  const safeId = idSchema.parse(id);
  // Agency-wide notifications now persist as read for this user only.
  await mockApiRequest({
    method: 'POST',
    path: `/notifications/${encodeURIComponent(safeId)}/read`,
    response: okResponse,
    mock: () => mockReadNotification(safeId),
  });
}
