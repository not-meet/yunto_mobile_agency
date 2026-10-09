import { ApiError } from '@/utils/api';

// TEMPORARY fixtures for the messages panel and notifications screen. Delete with the folder.

const avatar = (seed: string) => `https://picsum.photos/seed/yunto-${seed}/96/96`;

const DIRECT_MESSAGES = [
  { id: 'dm_01', name: 'Dev Singh', avatarUrl: avatar('dev'), online: true, unread: false },
  {
    id: 'dm_02',
    name: 'Sanjay Sharma',
    avatarUrl: avatar('sanjay'),
    online: false,
    unread: false,
  },
  { id: 'dm_03', name: 'Pooja Singh', avatarUrl: avatar('pooja'), online: true, unread: true },
];

const CAMPAIGN_CHANNELS = [
  { id: 'cmp_01', name: 'Nike X Socyio', unreadCount: 0, channelId: 'ch_cmp_01' },
  { id: 'cmp_02', name: 'Baseskincare', unreadCount: 3, channelId: 'ch_cmp_02' },
];

// GET /inbox. Campaign channels and direct messages both open GET /inbox/chats/:channelId.
export function mockGetInbox() {
  return {
    workspace: { name: 'Socyio' },
    announcements: { unread: true },
    campaigns: CAMPAIGN_CHANNELS,
    directMessages: DIRECT_MESSAGES,
    me: { name: 'Sophia Roy', handle: 'Sophiaroy', avatarUrl: null },
  };
}

type MockChatMessage = { id: string; from: 'me' | 'them'; text: string; sentAt: string };

const chats = new Map<string, MockChatMessage[]>();

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

function findChannel(channelId: string) {
  const person = DIRECT_MESSAGES.find((dm) => dm.id === channelId);
  if (person) {
    return {
      channel: {
        kind: 'direct' as const,
        name: person.name,
        avatarUrl: person.avatarUrl,
        online: person.online,
      },
      greeting: `Hey! This is ${person.name.split(' ')[0] ?? person.name}. Do you have a minute to go over this week’s shoots?`,
      markRead: () => {
        person.unread = false;
      },
    };
  }
  const campaign = CAMPAIGN_CHANNELS.find((c) => c.channelId === channelId);
  if (campaign) {
    return {
      channel: { kind: 'campaign' as const, name: campaign.name, avatarUrl: null, online: false },
      greeting: `Welcome to the ${campaign.name} channel. Share updates on the shoot here.`,
      markRead: () => {
        campaign.unreadCount = 0;
      },
    };
  }
  throw new ApiError('Chat not found', 404, { message: 'Chat not found' });
}

function getChatRecord(channelId: string) {
  const found = findChannel(channelId);
  let messages = chats.get(channelId);
  if (!messages) {
    messages = [
      { id: `${channelId}_m1`, from: 'them', text: found.greeting, sentAt: minutesAgo(180) },
      {
        id: `${channelId}_m2`,
        from: 'me',
        text: 'Sure, share the details and I’ll take a look.',
        sentAt: minutesAgo(170),
      },
    ];
    chats.set(channelId, messages);
  }
  return { ...found, messages };
}

// GET /inbox/chats/:channelId. Opening a chat marks it read.
export function mockGetChat(channelId: string) {
  const { channel, messages, markRead } = getChatRecord(channelId);
  markRead();
  const { name, avatarUrl, online } = channel;
  return { person: { name, avatarUrl, online }, messages };
}

// POST /inbox/chats/:channelId/messages. The other side "replies" straight away so the chat can
// be tried end to end. Returns the sent message plus everything newer than `afterId`.
export function mockSendChatMessage(
  channelId: string,
  payload: { text: string; afterId?: string } | undefined,
) {
  if (!payload) throw new ApiError('Invalid message', 400, { message: 'Invalid message' });
  const { messages } = getChatRecord(channelId);
  const after = payload.afterId ? messages.findIndex((m) => m.id === payload.afterId) : -1;
  const missed = after >= 0 ? messages.slice(after + 1) : [];
  const now = Date.now();
  const sent: MockChatMessage[] = [
    { id: `msg_${now}`, from: 'me', text: payload.text, sentAt: new Date(now).toISOString() },
    {
      id: `msg_${now}_reply`,
      from: 'them',
      text: 'Got it, thanks!',
      sentAt: new Date(now + 1000).toISOString(),
    },
  ];
  messages.push(...sent);
  return { messages: [...missed, ...sent] };
}

// Times are fixed at launch, so they don't move on each refetch.
const LAUNCHED_AT = Date.now();
const HOUR = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(LAUNCHED_AT - hours * HOUR).toISOString();

const ATTENTION = [
  {
    id: 'att_01',
    kind: 'leads' as const,
    title: '3 leads need response',
    subtitle: 'Tap to review',
  },
  {
    id: 'att_02',
    kind: 'deadline' as const,
    title: 'Campaign deadline in 2 days',
    subtitle: 'Urban Tech SS24',
  },
  {
    id: 'att_03',
    kind: 'payment' as const,
    title: 'Payment pending from Nike',
    subtitle: 'Tap to review',
  },
];

const NOTIFICATIONS = [
  {
    id: 'ntf_01',
    kind: 'offer' as const,
    title: 'Adidas sent an offer',
    subtitle: 'Campaign: Summer Glow',
    hours: 0.2,
  },
  {
    id: 'ntf_02',
    kind: 'lead' as const,
    title: 'New lead from Instagram',
    subtitle: 'Riya Kapoor · Reels collab',
    hours: 1.5,
  },
  {
    id: 'ntf_03',
    kind: 'payment' as const,
    title: 'Payment received',
    subtitle: '₹24,000 from Glossier',
    hours: 3,
  },
  {
    id: 'ntf_04',
    kind: 'campaign' as const,
    title: 'Boat Audio approved your script',
    subtitle: 'Campaign: Beats Drop',
    hours: 26,
  },
  {
    id: 'ntf_05',
    kind: 'lead' as const,
    title: 'Rohan Mehta replied',
    subtitle: 'Wants to move the call to Friday',
    hours: 30,
  },
  {
    id: 'ntf_06',
    kind: 'offer' as const,
    title: 'Mamaearth sent an offer',
    subtitle: 'Campaign: Monsoon Care',
    hours: 3 * 24,
  },
  {
    id: 'ntf_07',
    kind: 'payment' as const,
    title: 'Invoice overdue',
    subtitle: 'Urban Tech SS24 · ₹18,500',
    hours: 5 * 24,
  },
];

// POST /notifications/attention/:id/dismiss and /notifications/:id/read.
const dismissedIds = new Set<string>();
const readIds = new Set<string>(['ntf_03', 'ntf_05', 'ntf_07']);

export function mockDismissAttention(id: string) {
  dismissedIds.add(id);
  return { ok: true as const };
}

export function mockReadNotification(id: string) {
  readIds.add(id);
  return { ok: true as const };
}

// GET /notifications
export function mockGetNotifications() {
  return {
    attention: ATTENTION.filter((item) => !dismissedIds.has(item.id)),
    notifications: NOTIFICATIONS.map(({ hours, ...item }) => ({
      ...item,
      createdAt: hoursAgo(hours),
      read: readIds.has(item.id),
    })),
  };
}
