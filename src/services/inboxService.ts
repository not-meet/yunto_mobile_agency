import { z } from 'zod';

import { mockGetChat, mockGetInbox, mockSendChatMessage } from '@/dummy/inbox';
import { mockApiRequest } from '@/dummy/mockApi';
import { CHAT_MESSAGE_MAX } from '@/services/talentCampaignService';

// The messages side panel on home: agency announcements, campaign chats and direct messages.

const countSchema = z.number().int().nonnegative();
const idSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

const inboxCampaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // Messages the creator hasn't read yet; the chat is highlighted while it's above 0.
  unreadCount: countSchema,
  // The campaign's chat channel, opened in the same chat screen as a direct message.
  channelId: idSchema,
});
export type InboxCampaign = z.infer<typeof inboxCampaignSchema>;

const directMessageSchema = z.object({
  // The direct message's chat channel id.
  id: idSchema,
  name: z.string().min(1),
  // null until the person uploads a photo.
  avatarUrl: z.url().nullable(),
  online: z.boolean(),
  unread: z.boolean(),
});
export type DirectMessage = z.infer<typeof directMessageSchema>;

const inboxSchema = z.object({
  // The agency workspace the creator belongs to, e.g. "Socyio".
  workspace: z.object({ name: z.string().min(1) }),
  announcements: z.object({ unread: z.boolean() }),
  campaigns: z.array(inboxCampaignSchema),
  directMessages: z.array(directMessageSchema),
  me: z.object({
    name: z.string().min(1),
    // Without the "@"; null when the creator has none.
    handle: z.string().min(1).nullable(),
    // The server may leave it out.
    avatarUrl: z.url().nullable().default(null),
  }),
});
export type Inbox = z.infer<typeof inboxSchema>;

export function getInbox(): Promise<Inbox> {
  return mockApiRequest({
    method: 'GET',
    path: '/inbox',
    response: inboxSchema,
    mock: mockGetInbox,
  });
}

// One chat screen for both kinds of channel: a direct message (`directMessages[].id`) and a
// campaign's channel (`campaigns[].channelId`). Opening it marks it read on the server.

const chatPath = (channelId: string) =>
  `/inbox/chats/${encodeURIComponent(idSchema.parse(channelId))}`;

const chatMessageSchema = z.object({
  id: z.string().min(1),
  // Who sent it: the creator or anyone else in the channel.
  from: z.enum(['me', 'them']).catch('them'),
  text: z.string().trim().min(1).max(CHAT_MESSAGE_MAX),
  sentAt: z.iso.datetime(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

// The last 200 messages. `person` is the other person for a direct message, the channel for a
// campaign's chat.
const chatResponse = z.object({
  person: z.object({
    name: z.string().min(1),
    avatarUrl: z.url().nullable(),
    online: z.boolean(),
  }),
  // Oldest first.
  messages: z.array(chatMessageSchema),
});

export type ChatKind = 'direct' | 'campaign';

export interface Chat {
  // Shown in the header. `online` is only meaningful for a direct message.
  channel: z.infer<typeof chatResponse>['person'] & { kind: ChatKind };
  messages: ChatMessage[];
}

// `kind` comes from where the chat was opened (the inbox lists both kinds).
export async function getChat(channelId: string, kind: ChatKind): Promise<Chat> {
  const { person, messages } = await mockApiRequest({
    method: 'GET',
    path: chatPath(channelId),
    response: chatResponse,
    mock: () => mockGetChat(idSchema.parse(channelId)),
  });
  return { channel: { ...person, kind }, messages };
}

const sendChatMessageRequest = z.object({
  text: z.string().trim().min(1).max(CHAT_MESSAGE_MAX),
  // The last message on screen; the response also carries anything newer than it.
  afterId: z.string().min(1).optional(),
});
// The sent message plus anything newer than `afterId` (replies that came in meanwhile).
const sendChatMessageResponse = z.object({
  messages: z.array(chatMessageSchema).min(1),
});

export async function sendChatMessage(
  channelId: string,
  { text, afterId }: { text: string; afterId?: string },
  // One per user action (a tap on send), reused if that action is retried.
  idempotencyKey: string,
): Promise<ChatMessage[]> {
  const { messages } = await mockApiRequest({
    method: 'POST',
    path: `${chatPath(channelId)}/messages`,
    request: sendChatMessageRequest,
    body: { text, afterId },
    response: sendChatMessageResponse,
    idempotencyKey,
    mock: (payload) => mockSendChatMessage(idSchema.parse(channelId), payload),
  });
  return messages;
}
