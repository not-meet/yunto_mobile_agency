import { mockCalendarCreator } from '@/dummy/creators';
import { ApiError } from '@/utils/api';
import { todayKey } from '@/utils/dates';

// TEMPORARY fixtures + handlers for a creator's content calendar. Delete with the folder.
//
// Each creator's month is made up the first time it's asked for (the same way every time), then
// held in memory so saved, shifted and deleted pieces stick until a restart. The content editor's
// mock (content.ts) reads and writes the same pieces.

export type MockPlatform = 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'tiktok' | 'x';
export type MockType =
  'reel' | 'post' | 'story' | 'carousel' | 'short' | 'integrated' | 'dedicated' | 'ugc';

export interface MockMedia {
  id: string;
  name: string;
  mime: string;
  size: number;
  url: string;
}

export interface MockVersion {
  n: number;
  body: string;
  note: string;
  at: string;
}

export interface MockBrand {
  name: string;
  amount: number | null;
  deal: 'paid' | 'barter' | 'hybrid';
  disclosure: string;
}

export interface MockPost {
  id: string;
  title: string;
  body: string;
  platform: MockPlatform | null;
  contentType: MockType | null;
  status: 'draft' | 'scheduled' | 'posted';
  date: string;
  time: string;
  // Shown on the calendar: the collab's brand name.
  brand: string | null;
  brandInfo: MockBrand | null;
  brandCollab: boolean;
  segment: string | null;
  topics: string[];
  media: MockMedia[];
  versions: MockVersion[];
  autopost: boolean;
  ai: boolean;
}

const TITLES = [
  'Morning routine, festive edition',
  'Get ready with me: date night',
  'Five things I’m loving this week',
  'Behind the scenes at the shoot',
  'Honest review: new launch',
  'Mini vlog: weekend in the city',
  'Outfit of the day, three ways',
  'Q&A with followers',
];
const BRANDS = ['Nykaa', 'boAt', 'Mamaearth', 'Myntra'];
const BODIES = [
  'Nobody tells you this about festive mornings. I start with ten minutes of quiet before the chaos. Then three quick looks, each under 60 seconds. The last one surprised even me! Comment "list" and I’ll send you everything I used.',
  'Saving this one for the weekend. Three outfits, one jacket, zero stress. Which look is your favourite? Tell me in the comments.',
  '',
];
const TOPICS = [['#festive', '#grwm'], ['#ootd'], []];
// Days of the month with something on them; a month only uses the ones it has.
const DAYS = [2, 5, 8, 9, 13, 16, 19, 22, 24, 27, 30];

const MONTHS = new Map<string, MockPost[]>();
let nextId = 1;

export const mockNextId = (prefix: string) => `${prefix}_${Date.now()}_${nextId++}`;

function typeFor(platform: MockPlatform, i: number): MockType {
  if (platform === 'youtube') return i % 2 === 0 ? 'short' : 'dedicated';
  if (platform === 'instagram') return (['reel', 'story', 'carousel', 'post'] as const)[i % 4]!;
  return 'post';
}

function makeMonth(creatorId: string, month: string): MockPost[] {
  const { platforms } = mockCalendarCreator(creatorId);
  const [year = 2026, mon = 1] = month.split('-').map(Number);
  const length = new Date(year, mon, 0).getDate();
  const seed = [...`${creatorId}${month}`].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const today = todayKey();

  return DAYS.filter((day, i) => day <= length && (seed + i) % 3 !== 0).map((day, i) => {
    const platform = platforms[(seed + i) % platforms.length] ?? 'instagram';
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const brand = (seed + i) % 4 === 0 ? (BRANDS[(seed + i) % BRANDS.length] ?? null) : null;
    const body = BODIES[(seed + i) % BODIES.length] ?? '';
    return {
      id: `${creatorId}-${month}-${day}`,
      title: brand ? `${brand} collab` : (TITLES[(seed + i) % TITLES.length] ?? 'Untitled'),
      body,
      platform,
      contentType: typeFor(platform, seed + i),
      status: date < today ? 'posted' : (seed + i) % 5 === 0 ? 'draft' : 'scheduled',
      date,
      time: '09:00',
      brand,
      brandInfo: brand
        ? { name: brand, amount: 40000, deal: 'paid', disclosure: 'Paid partnership tag' }
        : null,
      brandCollab: brand !== null,
      segment: null,
      topics: TOPICS[(seed + i) % TOPICS.length] ?? [],
      media: [],
      versions: body
        ? [{ n: 1, body, note: 'First draft', at: new Date(Date.now() - 86_400_000).toISOString() }]
        : [],
      autopost: false,
      ai: (seed + i) % 6 === 1,
    };
  });
}

export function mockMonthOf(creatorId: string, month: string): MockPost[] {
  const key = `${creatorId}:${month}`;
  const existing = MONTHS.get(key);
  if (existing) return existing;
  const made = makeMonth(creatorId, month);
  MONTHS.set(key, made);
  return made;
}

// Every piece of the creator's held so far, with the month list it sits in.
export function mockCreatorPosts(creatorId: string): { post: MockPost; list: MockPost[] }[] {
  const out: { post: MockPost; list: MockPost[] }[] = [];
  for (const [key, posts] of MONTHS) {
    if (key.startsWith(`${creatorId}:`)) for (const post of posts) out.push({ post, list: posts });
  }
  return out;
}

export function mockFindPost(creatorId: string, postId: string) {
  const found = mockCreatorPosts(creatorId).find(({ post }) => post.id === postId);
  if (!found) throw new ApiError('Content not found', 404, { message: 'Content not found' });
  return found;
}

// GET /creators/:id/calendar?month=YYYY-MM
export function mockGetCreatorCalendar(creatorId: string, month: string) {
  return {
    posts: [...mockMonthOf(creatorId, month)]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((post) => ({
        id: post.id,
        title: post.title || 'Untitled post',
        platform: post.platform ?? ('UNKNOWN' as const),
        contentType: post.contentType ?? ('UNKNOWN' as const),
        status: post.status,
        date: post.date,
        brand: post.brand,
        ai: post.ai,
      })),
    canEdit: mockCalendarCreator(creatorId).onRoster,
  };
}

// DELETE /creators/:id/calendar/:postId
export function mockDeleteCalendarPost(creatorId: string, postId: string) {
  const { post, list } = mockFindPost(creatorId, postId);
  list.splice(list.indexOf(post), 1);
  return { ok: true as const };
}
