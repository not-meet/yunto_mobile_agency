import { ApiError } from '@/utils/api';

// TEMPORARY fixtures + handlers for the creators screens. Delete with the folder.
//
// Held in memory only: invited creators are gone after a restart. Times are fixed at launch.

const LAUNCHED_AT = Date.now();
const HOUR_MS = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(LAUNCHED_AT - hours * HOUR_MS).toISOString();
const avatar = (seed: string) => `https://picsum.photos/seed/yunto-roster-${seed}/96/96`;

type MockPlatform = 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'tiktok' | 'x';
type MockGender = 'female' | 'male' | 'other';
type MockAgeRange = '13-18' | '19-25' | '26-35' | '36-50' | '50+';
type MockSort = 'newest' | 'engagement' | 'views' | 'followers';

interface MockCreator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  // Biggest first.
  platforms: MockPlatform[];
  niche: string;
  categories: string[];
  followers: number;
  avgViews: number;
  engagementRate: number;
  leads: number;
  vsAverage: number;
  rateSuggestion: 'increase' | 'hold' | 'decrease';
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  gender: MockGender | null;
  ageRange: MockAgeRange | null;
  tags: string[];
  // Rupees for a reel; stories and posts are priced off it.
  reelRate: number | null;
  rosterStatus: 'active' | 'invited' | null;
  addedAt: string;
}

const CREATORS: MockCreator[] = [
  {
    id: 'leena',
    name: 'Leena Sharma',
    handle: '@leenabliss',
    avatarUrl: avatar('leena'),
    platforms: ['instagram', 'youtube'],
    niche: 'Fashion & Lifestyle',
    categories: ['Lifestyle', 'Beauty'],
    followers: 1_200_000,
    avgViews: 900_000,
    engagementRate: 3.9,
    leads: 4,
    vsAverage: 35,
    rateSuggestion: 'increase',
    phone: '+919811002233',
    email: 'leena@leenabliss.com',
    city: 'Mumbai',
    state: 'MH',
    gender: 'female',
    ageRange: '19-25',
    tags: ['Couple'],
    reelRate: 1000,
    rosterStatus: 'active',
    addedAt: hoursAgo(2),
  },
  {
    id: 'riya',
    name: 'Riya Verma',
    handle: '@riyabliss',
    avatarUrl: avatar('riya'),
    platforms: ['instagram'],
    niche: 'Beauty & Wellness',
    categories: ['Skincare'],
    followers: 486_000,
    avgViews: 212_000,
    engagementRate: 5.1,
    leads: 2,
    vsAverage: 18,
    rateSuggestion: 'increase',
    phone: '+919822113344',
    email: 'riya.verma@gmail.com',
    city: 'Delhi',
    state: 'DL',
    gender: 'female',
    ageRange: '19-25',
    tags: [],
    reelRate: 18_000,
    rosterStatus: 'invited',
    addedAt: hoursAgo(6),
  },
  {
    id: 'aarav',
    name: 'Aarav Mehta',
    handle: '@aarav.travels',
    avatarUrl: avatar('aarav'),
    platforms: ['instagram', 'youtube'],
    niche: 'Travel',
    categories: ['Adventure', 'Food'],
    followers: 1_800_000,
    avgViews: 840_000,
    engagementRate: 4.2,
    leads: 6,
    vsAverage: 22,
    rateSuggestion: 'hold',
    phone: '+919876543210',
    email: 'hello@aaravtravels.in',
    city: 'Mumbai',
    state: 'MH',
    gender: 'male',
    ageRange: '26-35',
    tags: ['Couple'],
    reelRate: 45_000,
    rosterStatus: 'active',
    addedAt: hoursAgo(20),
  },
  {
    id: 'kabir',
    name: 'Kabir Rao',
    handle: '@kabirvlogs',
    avatarUrl: avatar('kabir'),
    platforms: ['youtube', 'instagram'],
    niche: 'Artists & Films',
    categories: ['Vlogs'],
    followers: 2_400_000,
    avgViews: 1_100_000,
    engagementRate: 3.8,
    leads: 3,
    vsAverage: 12,
    rateSuggestion: 'hold',
    phone: '+919812340002',
    email: 'kabir@kabirvlogs.com',
    city: 'Bengaluru',
    state: 'KA',
    gender: 'male',
    ageRange: '26-35',
    tags: [],
    reelRate: 90_000,
    rosterStatus: 'active',
    addedAt: hoursAgo(44),
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    handle: '@meera.eats',
    avatarUrl: avatar('meera'),
    platforms: ['instagram'],
    niche: 'Health & Fitness',
    categories: ['Food', 'Nutrition'],
    followers: 312_000,
    avgViews: 140_000,
    engagementRate: 6.3,
    leads: 1,
    vsAverage: 41,
    rateSuggestion: 'increase',
    phone: '+919812340004',
    email: null,
    city: 'Chennai',
    state: 'TN',
    gender: 'female',
    ageRange: '26-35',
    tags: ['Family'],
    reelRate: 15_000,
    rosterStatus: 'active',
    addedAt: hoursAgo(70),
  },
  {
    id: 'rohan',
    name: 'Rohan Das',
    handle: '@rohan.fits',
    avatarUrl: null,
    platforms: ['youtube'],
    niche: 'Health & Fitness',
    categories: ['Gym'],
    followers: 768_000,
    avgViews: 390_000,
    engagementRate: 4.7,
    leads: 2,
    vsAverage: -8,
    rateSuggestion: 'decrease',
    phone: '+919812340005',
    email: 'rohan@fitsquad.in',
    city: 'Pune',
    state: 'MH',
    gender: 'male',
    ageRange: '19-25',
    tags: ['Student'],
    reelRate: 24_000,
    rosterStatus: 'invited',
    addedAt: hoursAgo(96),
  },
  {
    id: 'tara',
    name: 'Tara Sen',
    handle: '@tara.glow',
    avatarUrl: avatar('tara'),
    platforms: ['instagram', 'facebook'],
    niche: 'Beauty & Wellness',
    categories: ['Makeup'],
    followers: 954_000,
    avgViews: 505_000,
    engagementRate: 4.9,
    leads: 5,
    vsAverage: 27,
    rateSuggestion: 'increase',
    phone: '+919812340006',
    email: 'tara@glowstudio.in',
    city: 'Kolkata',
    state: 'WB',
    gender: 'female',
    ageRange: '26-35',
    tags: [],
    reelRate: 36_000,
    rosterStatus: 'active',
    addedAt: hoursAgo(120),
  },
  {
    id: 'ishaan',
    name: 'Ishaan Kapoor',
    handle: '@ishaan.money',
    avatarUrl: avatar('ishaan'),
    platforms: ['youtube', 'linkedin', 'x'],
    niche: 'Finance',
    categories: ['Investing'],
    followers: 640_000,
    avgViews: 260_000,
    engagementRate: 3.1,
    leads: 2,
    vsAverage: 4,
    rateSuggestion: 'hold',
    phone: '+919812340007',
    email: 'ishaan@moneytalks.in',
    city: 'Delhi',
    state: 'DL',
    gender: 'male',
    ageRange: '26-35',
    tags: [],
    reelRate: 30_000,
    rosterStatus: 'active',
    addedAt: hoursAgo(150),
  },
  {
    id: 'naina',
    name: 'Naina Joshi',
    handle: '@naina.makes',
    avatarUrl: avatar('naina'),
    platforms: ['instagram', 'tiktok'],
    niche: 'Crafts & DIY',
    categories: ['Home Decor'],
    followers: 128_000,
    avgViews: 64_000,
    engagementRate: 7.4,
    leads: 0,
    vsAverage: 52,
    rateSuggestion: 'increase',
    phone: null,
    email: 'naina.makes@gmail.com',
    city: 'Jaipur',
    state: 'RJ',
    gender: 'female',
    ageRange: '19-25',
    tags: ['Student'],
    reelRate: 6000,
    rosterStatus: 'invited',
    addedAt: hoursAgo(190),
  },
  {
    id: 'vikram',
    name: 'Vikram Singh',
    handle: '@vikram.roams',
    avatarUrl: avatar('vikram'),
    platforms: ['instagram'],
    niche: 'Travel',
    categories: ['Bikes'],
    followers: 410_000,
    avgViews: 180_000,
    engagementRate: 3.6,
    leads: 1,
    vsAverage: -4,
    rateSuggestion: 'hold',
    phone: '+919812340009',
    email: null,
    city: 'Delhi',
    state: 'DL',
    gender: 'male',
    ageRange: '36-50',
    tags: [],
    reelRate: 14_000,
    rosterStatus: 'active',
    addedAt: hoursAgo(240),
  },
  // On Yunto, not on the agency's roster.
  {
    id: 'sana',
    name: 'Sana Qureshi',
    handle: '@sana.styles',
    avatarUrl: avatar('sana'),
    platforms: ['instagram'],
    niche: 'Fashion & Lifestyle',
    categories: ['Streetwear'],
    followers: 520_000,
    avgViews: 230_000,
    engagementRate: 5.4,
    leads: 0,
    vsAverage: 30,
    rateSuggestion: 'increase',
    phone: '+919812340010',
    email: null,
    city: 'Delhi',
    state: 'DL',
    gender: 'female',
    ageRange: '19-25',
    tags: [],
    reelRate: 22_000,
    rosterStatus: null,
    addedAt: hoursAgo(12),
  },
  {
    id: 'arjun',
    name: 'Arjun Nair',
    handle: '@arjun.lens',
    avatarUrl: avatar('arjun'),
    platforms: ['instagram', 'youtube'],
    niche: 'Artists & Films',
    categories: ['Photography'],
    followers: 98_000,
    avgViews: 41_000,
    engagementRate: 6.8,
    leads: 0,
    vsAverage: 19,
    rateSuggestion: 'increase',
    phone: null,
    email: null,
    city: 'Kochi',
    state: 'KL',
    gender: 'male',
    ageRange: '19-25',
    tags: [],
    reelRate: 5000,
    rosterStatus: null,
    addedAt: hoursAgo(30),
  },
  {
    id: 'priya',
    name: 'Priya & Dev',
    handle: '@twoandaway',
    avatarUrl: avatar('twoandaway'),
    platforms: ['instagram', 'youtube'],
    niche: 'Travel',
    categories: ['Couples'],
    followers: 1_050_000,
    avgViews: 610_000,
    engagementRate: 4.4,
    leads: 0,
    vsAverage: 15,
    rateSuggestion: 'hold',
    phone: '+919812340012',
    email: null,
    city: 'Goa',
    state: 'GA',
    gender: 'other',
    ageRange: '26-35',
    tags: ['Couple'],
    reelRate: 40_000,
    rosterStatus: null,
    addedAt: hoursAgo(60),
  },
  {
    id: 'zoya',
    name: 'Zoya Khan',
    handle: '@zoya.paints',
    avatarUrl: null,
    platforms: ['instagram'],
    niche: 'Crafts & DIY',
    categories: ['Art'],
    followers: 42_000,
    avgViews: 18_000,
    engagementRate: 8.2,
    leads: 0,
    vsAverage: 60,
    rateSuggestion: 'increase',
    phone: null,
    email: null,
    city: 'Lucknow',
    state: 'UP',
    gender: 'female',
    ageRange: '13-18',
    tags: ['Student'],
    reelRate: 2500,
    rosterStatus: null,
    addedAt: hoursAgo(100),
  },
  {
    id: 'harsh',
    name: 'Harsh Bajaj',
    handle: '@harsh.invests',
    avatarUrl: avatar('harsh'),
    platforms: ['linkedin', 'x'],
    niche: 'Finance',
    categories: ['Startups'],
    followers: 210_000,
    avgViews: 70_000,
    engagementRate: 2.6,
    leads: 0,
    vsAverage: -15,
    rateSuggestion: 'decrease',
    phone: null,
    email: null,
    city: 'Bengaluru',
    state: 'KA',
    gender: 'male',
    ageRange: '36-50',
    tags: [],
    reelRate: null,
    rosterStatus: null,
    addedAt: hoursAgo(200),
  },
  {
    id: 'anika',
    name: 'Anika Rao',
    handle: '@anika.everyday',
    avatarUrl: avatar('anika'),
    platforms: ['instagram'],
    niche: 'Other',
    categories: ['Parenting'],
    followers: 260_000,
    avgViews: 95_000,
    engagementRate: 5.0,
    leads: 0,
    vsAverage: 9,
    rateSuggestion: 'hold',
    phone: null,
    email: null,
    city: 'Hyderabad',
    state: 'TS',
    gender: 'female',
    ageRange: '36-50',
    tags: ['Family'],
    reelRate: 11_000,
    rosterStatus: null,
    addedAt: hoursAgo(260),
  },
];

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function findCreator(id: string): MockCreator {
  const creator = CREATORS.find((c) => c.id === id);
  if (!creator) throw new ApiError('Creator not found', 404, { message: 'Creator not found' });
  return creator;
}

function toListItem(creator: MockCreator) {
  const { id, name, handle, avatarUrl, niche, followers, avgViews, engagementRate } = creator;
  const { leads, vsAverage, rateSuggestion, phone, rosterStatus } = creator;
  return {
    id,
    name,
    handle,
    avatarUrl,
    platform: creator.platforms[0] ?? 'instagram',
    niche,
    followers,
    avgViews,
    engagementRate,
    leads,
    vsAverage,
    rateSuggestion,
    phone,
    profileUrl: `https://stellartalent.com/${slug(name)}`,
    rosterStatus,
  };
}

// Each platform after the first is a share of the biggest, so the numbers look plausible.
const PLATFORM_SHARE = [1, 0.42, 0.18];

function toDetails(creator: MockCreator) {
  const platforms = creator.platforms.map((platform, i) => {
    const followers = Math.round(creator.followers * (PLATFORM_SHARE[i] ?? 0.1));
    const engagementRate = Number((creator.engagementRate * (1 - i * 0.15)).toFixed(1));
    return {
      platform,
      followers,
      engagementRate,
      avgLikes: Math.round((followers * engagementRate) / 100),
      avgComments: Math.round((followers * engagementRate) / 1300),
    };
  });
  const rate = creator.reelRate;
  return {
    ...toListItem(creator),
    email: creator.email,
    location: creator.city ? [creator.city, creator.state].filter(Boolean).join(', ') : null,
    categories: [creator.niche, ...creator.categories],
    platforms,
    commercials:
      rate === null
        ? []
        : creator.platforms
            .filter((platform) => platform === 'instagram' || platform === 'youtube')
            .map((platform) =>
              platform === 'instagram'
                ? { platform, reel: rate, story: rate, post: rate }
                : { platform, reel: Math.round(rate * 1.5), story: null, post: null },
            ),
  };
}

interface MockSearch {
  scope: 'ours' | 'all';
  query: string;
  sort: MockSort;
  filters: {
    niches: string[];
    maxFollowers: number | null;
    tags: string[];
    ageRange: MockAgeRange | null;
    genders: MockGender[];
    locations: string[];
  };
}

const lower = (values: string[]) => values.map((v) => v.toLowerCase());

const SORTERS: Record<MockSort, (a: MockCreator, b: MockCreator) => number> = {
  newest: (a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt),
  engagement: (a, b) => b.engagementRate - a.engagementRate,
  views: (a, b) => b.avgViews - a.avgViews,
  followers: (a, b) => b.followers - a.followers,
};

// POST /creators/search
export function mockSearchCreators(payload: MockSearch | undefined) {
  if (!payload) throw new ApiError('Invalid search', 400, { message: 'Invalid search' });
  const { scope, sort, filters } = payload;
  const query = payload.query.trim().toLowerCase();
  const inScope = CREATORS.filter((c) => scope === 'all' || c.rosterStatus !== null);
  const niches = lower(filters.niches);
  const tags = lower(filters.tags);
  const locations = lower(filters.locations);

  const creators = inScope.filter(
    (c) =>
      (!query ||
        [c.name, c.handle, c.niche].some((field) => field.toLowerCase().includes(query))) &&
      (niches.length === 0 || niches.includes(c.niche.toLowerCase())) &&
      (filters.maxFollowers === null || c.followers <= filters.maxFollowers) &&
      (tags.length === 0 || c.tags.some((tag) => tags.includes(tag.toLowerCase()))) &&
      (filters.ageRange === null || c.ageRange === filters.ageRange) &&
      (filters.genders.length === 0 || (c.gender !== null && filters.genders.includes(c.gender))) &&
      (locations.length === 0 || (c.city !== null && locations.includes(c.city.toLowerCase()))),
  );

  return {
    creators: [...creators].sort(SORTERS[sort]).map(toListItem),
    total: inScope.length,
  };
}

// GET /creators/:id
export function mockGetCreator(id: string) {
  return { creator: toDetails(findCreator(id)) };
}

interface MockNewCreator {
  name: string;
  handle: string;
  email: string;
  phone: string | null;
  location: string | null;
  gender: MockGender | null;
  ageRange: MockAgeRange | null;
  platforms: MockPlatform[];
  followers: number | null;
  avgViews: number | null;
  engagementRate: number | null;
  ratePerPost: number | null;
  niche: string | null;
  categories: string[];
}

// POST /creators. The creator joins the roster as invited, at the top of "Newest Added".
export function mockCreateCreator(payload: MockNewCreator | undefined) {
  if (!payload) throw new ApiError('Invalid creator', 400, { message: 'Invalid creator' });
  const [city = null, state = null] = payload.location?.split(',').map((part) => part.trim()) ?? [];
  const creator: MockCreator = {
    id: `creator_${Date.now()}`,
    name: payload.name,
    handle: payload.handle,
    avatarUrl: null,
    platforms: payload.platforms,
    niche: payload.niche ?? 'Other',
    categories: payload.categories,
    followers: payload.followers ?? 0,
    avgViews: payload.avgViews ?? 0,
    engagementRate: payload.engagementRate ?? 0,
    leads: 0,
    vsAverage: 0,
    rateSuggestion: 'hold',
    phone: payload.phone,
    email: payload.email,
    city: city || null,
    state: state || null,
    gender: payload.gender,
    ageRange: payload.ageRange,
    tags: [],
    reelRate: payload.ratePerPost,
    rosterStatus: 'invited',
    addedAt: new Date().toISOString(),
  };
  CREATORS.unshift(creator);
  return { creator: toDetails(creator) };
}
