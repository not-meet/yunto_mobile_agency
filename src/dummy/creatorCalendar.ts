import { mockCalendarCreator } from '@/dummy/creators';
import { ApiError } from '@/utils/api';
import { todayKey } from '@/utils/dates';

// TEMPORARY fixtures + handlers for a creator's content calendar. Delete with the folder.
//
// Each creator's month is made up the first time it's asked for (the same way every time), then
// held in memory so added and deleted pieces stick until a restart.

type MockPlatform = 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'tiktok' | 'x';
type MockType =
  'reel' | 'post' | 'story' | 'carousel' | 'short' | 'integrated' | 'dedicated' | 'ugc';

interface MockPost {
  id: string;
  title: string;
  platform: MockPlatform;
  contentType: MockType;
  status: 'draft' | 'scheduled' | 'posted';
  date: string;
  brand: string | null;
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
// Days of the month with something on them; a month only uses the ones it has.
const DAYS = [2, 5, 8, 9, 13, 16, 19, 22, 24, 27, 30];

const MONTHS = new Map<string, MockPost[]>();
let nextId = 1;

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
    return {
      id: `${creatorId}-${month}-${day}`,
      title: brand ? `${brand} collab` : (TITLES[(seed + i) % TITLES.length] ?? 'Untitled'),
      platform,
      contentType: typeFor(platform, seed + i),
      status: date < today ? 'posted' : (seed + i) % 5 === 0 ? 'draft' : 'scheduled',
      date,
      brand,
      ai: (seed + i) % 6 === 1,
    };
  });
}

function monthOf(creatorId: string, month: string): MockPost[] {
  const key = `${creatorId}:${month}`;
  const existing = MONTHS.get(key);
  if (existing) return existing;
  const made = makeMonth(creatorId, month);
  MONTHS.set(key, made);
  return made;
}

// GET /creators/:id/calendar?month=YYYY-MM
export function mockGetCreatorCalendar(creatorId: string, month: string) {
  return {
    posts: [...monthOf(creatorId, month)].sort((a, b) => a.date.localeCompare(b.date)),
    canEdit: mockCalendarCreator(creatorId).onRoster,
  };
}

interface MockNewPost {
  title: string;
  platform: MockPlatform;
  contentType: MockType;
  date: string;
  brand: string | null;
}

// POST /creators/:id/calendar. Only for the agency's own creators.
export function mockAddCalendarPost(creatorId: string, payload: MockNewPost | undefined) {
  if (!payload) throw new ApiError('Invalid content', 400, { message: 'Invalid content' });
  if (!mockCalendarCreator(creatorId).onRoster) {
    throw new ApiError('Not on your roster', 403, { message: 'Not on your roster' });
  }
  const post: MockPost = {
    id: `post_${Date.now()}_${nextId++}`,
    ...payload,
    status: 'scheduled',
    ai: false,
  };
  monthOf(creatorId, payload.date.slice(0, 7)).push(post);
  return { post };
}

// DELETE /creators/:id/calendar/:postId
export function mockDeleteCalendarPost(creatorId: string, postId: string) {
  for (const [key, posts] of MONTHS) {
    if (!key.startsWith(`${creatorId}:`)) continue;
    const index = posts.findIndex((p) => p.id === postId);
    if (index >= 0) {
      posts.splice(index, 1);
      return { ok: true as const };
    }
  }
  throw new ApiError('Content not found', 404, { message: 'Content not found' });
}
