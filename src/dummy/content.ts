import {
  type MockBrand,
  mockCreatorPosts,
  mockFindPost,
  mockMonthOf,
  mockNextId,
  type MockPlatform,
  type MockPost,
  type MockType,
} from '@/dummy/creatorCalendar';
import { mockCalendarCreator } from '@/dummy/creators';
import { ApiError } from '@/utils/api';
import { addDays, fromDateKey, toDateKey } from '@/utils/dates';

// TEMPORARY handlers for the content editor. Delete with the folder. Pieces live in the
// calendar mock's months (creatorCalendar.ts), so what's saved here shows on the calendar.

const DEFAULT_SEGMENTS = ['Lifestyle', 'Fashion', 'Wellness', 'Food'];
const AGENCY_BRANDS = ['boAt', 'Kova', 'Mamaearth', 'Myntra', 'Nykaa', 'Sugar Cosmetics'];

function requireRoster(creatorId: string) {
  if (!mockCalendarCreator(creatorId).onRoster) {
    throw new ApiError('Not on your roster', 403, { message: 'Not on your roster' });
  }
}

function toResponse(post: MockPost) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    status: post.status,
    date: post.date,
    time: post.time,
    platform: post.platform,
    contentType: post.contentType,
    segment: post.segment,
    topics: post.topics,
    brandCollab: post.brandCollab,
    brand: post.brandInfo,
    media: post.media,
    versions: post.versions,
    autopost: post.autopost,
  };
}

// Instagram auto-post: connected and allowed for some creators, not for others.
function autoPostFor(creatorId: string, post: MockPost | null) {
  const { platforms, handle } = mockCalendarCreator(creatorId);
  if (!platforms.includes('instagram')) return { allowed: false, handle: null, job: null };
  const allowed = creatorId.length % 2 === 0;
  return {
    allowed,
    handle: handle.replace(/^@/, ''),
    job:
      allowed && post?.autopost
        ? { status: 'scheduled' as const, error: null, permalink: null }
        : null,
  };
}

const shiftable = (creatorId: string, date: string, exceptId: string | null) =>
  mockCreatorPosts(creatorId).filter(
    ({ post }) => post.id !== exceptId && post.status !== 'posted' && post.date >= date,
  );

// GET /creators/:id/content/editor?date=YYYY-MM-DD&post=:postId
export function mockGetContentEditor(creatorId: string, date: string, postId: string | null) {
  const { onRoster, niche } = mockCalendarCreator(creatorId);
  mockMonthOf(creatorId, date.slice(0, 7));
  const post = postId ? mockFindPost(creatorId, postId).post : null;
  const niches = niche.split(/\s*&\s*/).filter(Boolean);
  return {
    post: post ? toResponse(post) : null,
    canEdit: onRoster,
    segments: [...new Set([...niches, ...DEFAULT_SEGMENTS])].slice(0, 6),
    brandOptions: AGENCY_BRANDS,
    shiftCount: shiftable(creatorId, post?.date ?? date, postId).length,
    autoPost: autoPostFor(creatorId, post),
  };
}

interface MockSave {
  id?: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled';
  date: string;
  time: string;
  platform: MockPlatform | null;
  contentType: MockType | null;
  segment: string | null;
  topics: string[];
  brandCollab: boolean;
  brand: MockBrand | null;
  shiftExisting: boolean;
  versionNote: string;
  autopost?: boolean;
  caption?: string;
}

// Moves every later piece not posted yet a day on, across months.
function shiftFrom(creatorId: string, date: string, exceptId: string | null) {
  for (const { post, list } of shiftable(creatorId, date, exceptId)) {
    const next = toDateKey(addDays(fromDateKey(post.date), 1));
    list.splice(list.indexOf(post), 1);
    post.date = next;
    mockMonthOf(creatorId, next.slice(0, 7)).push(post);
  }
}

// POST /creators/:id/content (create, or update with `id`)
export function mockSaveContent(creatorId: string, payload: MockSave | undefined) {
  if (!payload) throw new ApiError('Invalid content', 400, { message: 'Invalid content' });
  requireRoster(creatorId);
  const { id, shiftExisting, versionNote, caption: _caption, brand, ...fields } = payload;

  const existing = id ? mockFindPost(creatorId, id) : null;
  if (shiftExisting) shiftFrom(creatorId, fields.date, id ?? null);

  const post: MockPost = existing?.post ?? {
    id: mockNextId('post'),
    title: '',
    body: '',
    platform: null,
    contentType: null,
    status: 'draft',
    date: fields.date,
    time: fields.time,
    brand: null,
    brandInfo: null,
    brandCollab: false,
    segment: null,
    topics: [],
    media: [],
    versions: [],
    autopost: false,
    ai: false,
  };
  const instagramOn = fields.autopost === true && fields.platform === 'instagram';
  Object.assign(post, {
    ...fields,
    title: fields.title || 'Untitled post',
    brand: fields.brandCollab ? (brand?.name ?? null) : null,
    brandInfo: fields.brandCollab ? brand : null,
    autopost: instagramOn && fields.status === 'scheduled',
  });

  if (post.body && post.body !== post.versions[0]?.body) {
    post.versions.unshift({
      n: (post.versions[0]?.n ?? 0) + 1,
      body: post.body,
      note: post.versions.length ? versionNote : 'First draft',
      at: new Date().toISOString(),
    });
  }

  // A new piece, or one moved to another month, goes in the month of its day.
  const month = mockMonthOf(creatorId, post.date.slice(0, 7));
  if (existing && existing.list !== month) existing.list.splice(existing.list.indexOf(post), 1);
  if (!month.includes(post)) month.push(post);

  return { post: toResponse(post), instagram: null };
}

interface MockUpload {
  files: { uri: string; name: string; mime: string; size: number }[];
}

// POST /creators/:id/content/:postId/media. The real one takes multipart and returns a URL.
export function mockUploadContentMedia(
  creatorId: string,
  postId: string,
  payload: MockUpload | undefined,
) {
  if (!payload) throw new ApiError('Invalid media', 400, { message: 'Invalid media' });
  requireRoster(creatorId);
  const { post } = mockFindPost(creatorId, postId);
  const media = payload.files.map(({ uri, name, mime, size }) => ({
    id: mockNextId('media'),
    name,
    mime,
    size,
    url: uri,
  }));
  post.media.push(...media);
  return { media };
}

// PUT /creators/:id/content/:postId/media/order
export function mockReorderContentMedia(
  creatorId: string,
  postId: string,
  payload: { ids: string[] } | undefined,
) {
  const { post } = mockFindPost(creatorId, postId);
  const order = payload?.ids ?? [];
  post.media.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ok: true as const };
}

// DELETE /creators/:id/content/:postId/media/:mediaId
export function mockDeleteContentMedia(creatorId: string, postId: string, mediaId: string) {
  const { post } = mockFindPost(creatorId, postId);
  post.media = post.media.filter((m) => m.id !== mediaId);
  return { ok: true as const };
}
