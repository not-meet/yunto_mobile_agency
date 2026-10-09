import { ApiError } from '@/utils/api';
import { addDays, toDateKey } from '@/utils/dates';

// Stand-in fixtures for the talent booking and talent request flows (copied from
// yunto_mobile_app) until the API exists. Only src/services/ reads this.

const LAUNCHED_AT = Date.now();
const MINUTE = 60_000;

type MockTalentCategory = 'fashion' | 'travel' | 'event' | 'makeup' | 'cinematic';
type MockIndianState =
  'Delhi' | 'Maharashtra' | 'Karnataka' | 'Goa' | 'Rajasthan' | 'Tamil Nadu' | 'West Bengal';

const photo = (seed: string) => `https://picsum.photos/seed/yunto-${seed}/700/940`;

// Public sample clips stand in for portfolio videos.
const SAMPLE_CLIPS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

// Four pieces each: two clips and two photos.
const pastWork = (seed: string) =>
  [0, 1, 2, 3].map((i) => {
    const thumb = `https://picsum.photos/seed/yunto-work-${seed}-${i}/480/620`;
    return {
      id: `work_${seed}_${i}`,
      type: i % 2 === 0 ? ('video' as const) : ('photo' as const),
      thumbnailUrl: thumb,
      mediaUrl:
        i % 2 === 0
          ? (SAMPLE_CLIPS[i / 2] ?? thumb)
          : `https://picsum.photos/seed/yunto-work-${seed}-${i}/1080/1400`,
    };
  });

const TALENTS = [
  {
    id: 'tal_01',
    role: 'videographer' as const,
    name: 'Sarthak',
    categories: ['fashion', 'cinematic'] as MockTalentCategory[],
    specialty: 'Fashion & Lifestyle Videographer',
    experienceYears: 5,
    brands: ['Nykaa', 'H&M'],
    bio: 'I turn brand vibes into scroll-stopping visuals. Specializing in high-retention edits and aesthetic storytelling for lifestyle brands.',
    photoUrl: photo('sarthak'),
    location: { area: 'Hauz Khas', state: 'Delhi' as MockIndianState },
    replyTime: '1 hr',
    rates: { basic: 4_000, standard: 8_000, premium: 15_000 },
    level: 'standard' as const,
    expertise: ['Fashion Films', 'Lookbooks', 'Reels', 'Color Grading', 'Product Shots'],
    rating: 4.9,
    reviewCount: 120,
    availability: ['Today', 'Sat'],
    pastWork: pastWork('01'),
  },
  {
    id: 'tal_02',
    role: 'videographer' as const,
    name: 'Aman',
    categories: ['travel', 'cinematic'] as MockTalentCategory[],
    specialty: 'Travel & Adventure Videographer',
    experienceYears: 4,
    brands: ['Zostel', 'MakeMyTrip'],
    bio: 'Mountains, beaches and everything between. I shoot travel stories that make people want to pack a bag tonight.',
    photoUrl: photo('aman'),
    location: { area: 'Bandra', state: 'Maharashtra' as MockIndianState },
    replyTime: '2 hrs',
    rates: { basic: 5_000, standard: 9_000, premium: 18_000 },
    level: 'standard' as const,
    expertise: ['Travel Films', 'Drone', 'Hyperlapse', 'Vlogs'],
    rating: 4.7,
    reviewCount: 86,
    availability: ['Fri', 'Sun'],
    pastWork: pastWork('02'),
  },
  {
    id: 'tal_03',
    role: 'videographer' as const,
    name: 'Priya',
    categories: ['event', 'makeup'] as MockTalentCategory[],
    specialty: 'Beauty & Event Videographer',
    experienceYears: 6,
    brands: ['Sugar', 'Lakmé'],
    bio: 'Close-ups that do the talking. I cover launches, GRWMs and beauty tutorials with soft light and clean framing.',
    photoUrl: photo('priya'),
    location: { area: 'Saket', state: 'Delhi' as MockIndianState },
    replyTime: '30 min',
    rates: { basic: 4_500, standard: 8_500, premium: 16_000 },
    level: 'premium' as const,
    expertise: ['Beauty Close-ups', 'Event Coverage', 'GRWM', 'Soft Lighting'],
    rating: 4.8,
    reviewCount: 142,
    availability: ['Today', 'Tue'],
    pastWork: pastWork('03'),
  },
  {
    id: 'tal_04',
    role: 'videographer' as const,
    name: 'Rohan',
    categories: ['cinematic', 'travel'] as MockTalentCategory[],
    specialty: 'Cinematic Brand Films',
    experienceYears: 8,
    brands: ['Royal Enfield', 'boAt'],
    bio: 'Short films for brands that want to feel like a movie. Drone, gimbal and anamorphic kits on every shoot.',
    photoUrl: photo('rohan'),
    location: { area: 'Indiranagar', state: 'Karnataka' as MockIndianState },
    replyTime: '3 hrs',
    rates: { basic: 7_000, standard: 12_000, premium: 25_000 },
    level: 'premium' as const,
    expertise: ['Brand Films', 'Anamorphic', 'Drone', 'Color Grading', 'Storyboarding'],
    rating: 5.0,
    reviewCount: 64,
    availability: ['Mon', 'Thu'],
    pastWork: pastWork('04'),
  },
  {
    id: 'tal_05',
    role: 'videographer' as const,
    name: 'Meera',
    categories: ['fashion', 'travel'] as MockTalentCategory[],
    specialty: 'Resort & Fashion Videographer',
    experienceYears: 3,
    brands: ['FabIndia', 'Taj Hotels'],
    bio: 'Sun, sand and slow motion. I shoot resort wear and stays with a warm, golden-hour look.',
    photoUrl: photo('meera'),
    location: { area: 'Anjuna', state: 'Goa' as MockIndianState },
    replyTime: '1 hr',
    rates: { basic: 3_500, standard: 7_000, premium: 13_000 },
    level: 'basic' as const,
    expertise: ['Resort Wear', 'Golden Hour', 'Slow Motion'],
    rating: 4.5,
    reviewCount: 23,
    availability: ['Today', 'Wed'],
    pastWork: pastWork('05'),
  },
  {
    id: 'tal_06',
    role: 'videographer' as const,
    name: 'Kabir',
    categories: ['event'] as MockTalentCategory[],
    specialty: 'Wedding & Event Videographer',
    experienceYears: 7,
    brands: ['Tanishq', 'Manyavar'],
    bio: 'Big days, bigger moments. Multi-camera event coverage delivered as reels within 48 hours.',
    photoUrl: photo('kabir'),
    location: { area: 'C-Scheme', state: 'Rajasthan' as MockIndianState },
    replyTime: '2 hrs',
    rates: { basic: 6_000, standard: 11_000, premium: 22_000 },
    level: 'basic' as const,
    expertise: ['Weddings', 'Multi-cam', 'Same-day Reels'],
    rating: 4.6,
    reviewCount: 41,
    availability: ['Sat', 'Sun'],
    pastWork: pastWork('06'),
  },
  {
    id: 'tal_07',
    role: 'editor' as const,
    name: 'Isha',
    categories: ['fashion', 'makeup'] as MockTalentCategory[],
    specialty: 'Fashion Reels Editor',
    experienceYears: 4,
    brands: ['Myntra', 'Nykaa'],
    bio: 'Beat-synced cuts and clean transitions. I edit fashion reels built to hold attention past the first second.',
    photoUrl: photo('isha'),
    location: { area: 'Rajouri Garden', state: 'Delhi' as MockIndianState },
    replyTime: '1 hr',
    rates: { basic: 1_500, standard: 4_000, premium: 6_500 },
    level: 'standard' as const,
    expertise: ['Beat Sync', 'Transitions', 'Fashion Reels', 'Captions'],
    rating: 4.8,
    reviewCount: 97,
    availability: ['Today', 'Sat'],
    pastWork: pastWork('07'),
  },
  {
    id: 'tal_08',
    role: 'editor' as const,
    name: 'Arjun',
    categories: ['cinematic'] as MockTalentCategory[],
    specialty: 'Cinematic Colourist & Editor',
    experienceYears: 6,
    brands: ['OnePlus', 'Red Bull'],
    bio: 'Colour grading and sound design that make phone footage look like it was shot on cinema glass.',
    photoUrl: photo('arjun'),
    location: { area: 'Andheri', state: 'Maharashtra' as MockIndianState },
    replyTime: '4 hrs',
    rates: { basic: 2_500, standard: 6_000, premium: 10_000 },
    level: 'premium' as const,
    expertise: ['Color Grading', 'Sound Design', 'Brand Films', 'Motion Graphics'],
    rating: 4.9,
    reviewCount: 158,
    availability: ['Wed', 'Fri'],
    pastWork: pastWork('08'),
  },
  {
    id: 'tal_09',
    role: 'editor' as const,
    name: 'Tanya',
    categories: ['makeup', 'fashion'] as MockTalentCategory[],
    specialty: 'Beauty Content Editor',
    experienceYears: 3,
    brands: ['Mamaearth', 'Sugar'],
    bio: 'Skin-true colour and snappy captions. I edit tutorials and GRWMs that feel native to the feed.',
    photoUrl: photo('tanya'),
    location: { area: 'Koramangala', state: 'Karnataka' as MockIndianState },
    replyTime: '2 hrs',
    rates: { basic: 1_200, standard: 3_200, premium: 5_000 },
    level: 'basic' as const,
    expertise: ['Beauty Tutorials', 'Skin-true Color', 'Captions'],
    rating: 4.4,
    reviewCount: 19,
    availability: ['Today', 'Mon'],
    pastWork: pastWork('09'),
  },
  {
    id: 'tal_10',
    role: 'editor' as const,
    name: 'Dev',
    categories: ['travel', 'cinematic'] as MockTalentCategory[],
    specialty: 'Travel Vlog Editor',
    experienceYears: 5,
    brands: ['Zostel', 'Airbnb'],
    bio: 'I turn hours of trip footage into tight, story-first vlogs and reels with map animations.',
    photoUrl: photo('dev'),
    location: { area: 'Lajpat Nagar', state: 'Delhi' as MockIndianState },
    replyTime: '3 hrs',
    rates: { basic: 2_000, standard: 5_000, premium: 8_500 },
    level: 'standard' as const,
    expertise: ['Travel Vlogs', 'Map Animations', 'Storytelling', 'Reels'],
    rating: 4.7,
    reviewCount: 73,
    availability: ['Thu', 'Sat'],
    pastWork: pastWork('10'),
  },
  {
    id: 'tal_11',
    role: 'editor' as const,
    name: 'Neha',
    categories: ['event'] as MockTalentCategory[],
    specialty: 'Event Highlights Editor',
    experienceYears: 4,
    brands: ['Sabyasachi', 'Zomato'],
    bio: 'Same-night highlight reels for launches and weddings, cut to the moments people rewatch.',
    photoUrl: photo('neha'),
    location: { area: 'Salt Lake', state: 'West Bengal' as MockIndianState },
    replyTime: '1 hr',
    rates: { basic: 1_800, standard: 4_500, premium: 7_500 },
    level: 'basic' as const,
    expertise: ['Event Highlights', 'Same-night Edits', 'Weddings'],
    rating: 4.5,
    reviewCount: 31,
    availability: ['Today', 'Sun'],
    pastWork: pastWork('11'),
  },
];

export function mockGetTalents(role: 'videographer' | 'editor') {
  return { talents: TALENTS.filter((t) => t.role === role) };
}

export function mockGetTalent(id: string) {
  const talent = TALENTS.find((t) => t.id === id);
  if (!talent) throw new ApiError('Talent not found', 404, { message: 'Talent not found' });
  return { talent };
}

// POST /talents/:id/bookings.
export function mockBookTalent(
  id: string,
  payload: { leadId?: string; campaignId?: string } | undefined,
) {
  if (!payload) throw new ApiError('Invalid booking', 400, { message: 'Invalid booking' });
  if (!TALENTS.some((t) => t.id === id)) {
    throw new ApiError('Talent not found', 404, { message: 'Talent not found' });
  }
  return {
    booking: {
      id: `bkg_${Date.now()}`,
      talentId: id,
      ...(payload.leadId ? { leadId: payload.leadId } : {}),
      ...(payload.campaignId ? { campaignId: payload.campaignId } : {}),
      status: 'requested' as const,
    },
  };
}

// Talent campaigns: the campaigns the creator is hiring videographers and editors for.

type MockCampaignStage = 'live' | 'pending-delivery' | 'shortlisted';
type MockCampaignHireStatus = 'attention' | 'accepted' | 'pending-delivery';

// A deadline `days` from launch, as "YYYY-MM-DD".
const deadlineIn = (days: number) => toDateKey(addDays(new Date(LAUNCHED_AT), days));

function talentCampaign(
  id: string,
  title: string,
  campaign: string,
  role: 'videographer' | 'editor',
  stage: MockCampaignStage,
  status: MockCampaignHireStatus,
  deadlineDays: number,
  [pool, swiped, accepted, shortlisted]: [number, number, number, number],
) {
  return {
    id,
    title,
    campaign,
    // Every hire belongs to the brand campaign with the matching number (tc_01 → cmp_01).
    campaignId: id.replace(/^tc_/, 'cmp_'),
    role,
    stage,
    status,
    deadline: deadlineIn(deadlineDays),
    pool,
    swiped,
    accepted,
    shortlisted,
    confirmedRequestId: null as string | null,
  };
}

const TALENT_CAMPAIGNS = [
  talentCampaign(
    'tc_01',
    'Urban Tech SS24',
    'Urban Tech SS26',
    'videographer',
    'live',
    'attention',
    9,
    [16, 12, 3, 1],
  ),
  talentCampaign(
    'tc_02',
    'Summer Collection',
    'Myntra Summer Edit',
    'editor',
    'live',
    'accepted',
    14,
    [6, 5, 4, 0],
  ),
  talentCampaign(
    'tc_03',
    'Boat Audio Launch',
    'boAt Airdopes 2',
    'videographer',
    'live',
    'accepted',
    6,
    [12, 8, 2, 1],
  ),
  talentCampaign(
    'tc_04',
    'Puma Run Club',
    'Puma Velocity',
    'videographer',
    'live',
    'attention',
    21,
    [10, 4, 1, 2],
  ),
  talentCampaign(
    'tc_05',
    'Glow Up Series',
    'Sugar Cosmetics',
    'editor',
    'live',
    'accepted',
    11,
    [8, 6, 3, 1],
  ),
  talentCampaign(
    'tc_06',
    'Monsoon Getaways',
    'Zostel Monsoon',
    'videographer',
    'live',
    'attention',
    18,
    [14, 9, 2, 2],
  ),
  talentCampaign(
    'tc_07',
    'Festive Drop',
    'Tanishq Festive',
    'videographer',
    'pending-delivery',
    'pending-delivery',
    3,
    [9, 9, 2, 0],
  ),
  talentCampaign(
    'tc_08',
    'Street Style Reels',
    'H&M Divided',
    'editor',
    'pending-delivery',
    'pending-delivery',
    5,
    [7, 6, 1, 0],
  ),
  talentCampaign(
    'tc_09',
    'Resort Wear Diaries',
    'Taj Resort Wear',
    'videographer',
    'shortlisted',
    'attention',
    25,
    [12, 7, 0, 3],
  ),
  talentCampaign(
    'tc_10',
    'Skin First',
    'Mamaearth Skin',
    'editor',
    'shortlisted',
    'attention',
    20,
    [9, 5, 0, 2],
  ),
  talentCampaign(
    'tc_11',
    'Ride Out',
    'Royal Enfield Hunter',
    'videographer',
    'shortlisted',
    'attention',
    30,
    [11, 6, 0, 4],
  ),
  talentCampaign(
    'tc_12',
    'Launch Night',
    'OnePlus Nord',
    'editor',
    'shortlisted',
    'attention',
    16,
    [6, 4, 0, 1],
  ),
];

// GET /talent-campaigns
export function mockGetTalentCampaigns() {
  return { campaigns: TALENT_CAMPAIGNS };
}

const REQUEST_NOTES = {
  accepted: 'Accepted from both ends',
  pending: 'Shortlisted · awaiting reply',
  declined: 'Declined',
  completed: 'Delivered last week',
} as const;

// GET /talent-campaigns/:id/requests: the campaign's accepted talents first, then the ones still
// only shortlisted, then one from history.
export function mockGetCampaignRequests(id: string) {
  const campaign = TALENT_CAMPAIGNS.find((c) => c.id === id);
  if (!campaign) throw new ApiError('Campaign not found', 404, { message: 'Campaign not found' });

  const talents = TALENTS.filter((t) => t.role === campaign.role);
  const statuses = [
    ...Array<'accepted'>(campaign.accepted).fill('accepted'),
    ...Array<'pending'>(campaign.shortlisted).fill('pending'),
    campaign.stage === 'pending-delivery' ? ('completed' as const) : ('declined' as const),
  ];

  return {
    campaign,
    // One talent per request; any requests past the end of the list are dropped.
    requests: statuses.flatMap((status, i) => {
      const talent = talents[i];
      if (!talent) return [];
      return {
        id: `req_${campaign.id}_${i + 1}`,
        status,
        talent: {
          id: talent.id,
          name: talent.name,
          specialty: talent.specialty,
          photoUrl: talent.photoUrl,
          location: talent.location,
        },
        rate: talent.rates.standard,
        note: REQUEST_NOTES[status],
      };
    }),
  };
}

// POST /talent-campaigns/:id/requests/:requestId/confirm: held in memory only, so confirmations
// are gone after a restart. Confirming another talent replaces the earlier pick.
export function mockConfirmCampaignRequest(id: string, requestId: string) {
  const campaign = TALENT_CAMPAIGNS.find((c) => c.id === id);
  if (!campaign) throw new ApiError('Campaign not found', 404, { message: 'Campaign not found' });
  const request = mockGetCampaignRequests(id).requests.find((r) => r.id === requestId);
  if (!request || request.status !== 'accepted') {
    throw new ApiError('Request not confirmable', 409, {
      message: 'Only accepted talents can be confirmed',
    });
  }
  campaign.confirmedRequestId = requestId;
  return mockGetCampaignRequests(id);
}

// Talent chats: the campaign brief plus the messages with an accepted talent.

type MockChatMessage = { id: string; from: 'me' | 'talent'; text: string; sentAt: string };

const DEFAULT_BRIEF = {
  keyMessage: 'Celebrating your natural glow and how our serum enhances it effortlessly.',
  targetAudience: 'Gen Z & young millennial women looking for minimal, effective skincare.',
  guidelines: [
    'Shoot in natural daylight',
    'Show the product within the first 3 seconds',
    'Keep the tone honest and unfiltered',
  ],
  deliverables: ['1 Reel (30–45 sec)', '3 Stories with a link sticker'],
  notes: ['No competitor products in frame', 'Share a rough cut before final edit'],
};

const BRIEFS: Record<string, typeof DEFAULT_BRIEF> = {
  tc_01: {
    keyMessage: 'Tech that keeps up with the city: sleek, fast and made for life on the move.',
    targetAudience: 'Urban professionals aged 22–30 who love gadgets and street style.',
    guidelines: [
      'Shoot around city landmarks at golden hour',
      'Keep cuts fast, matching the music’s beat',
      'Feature the product in real, everyday moments',
    ],
    deliverables: ['1 Reel (30–45 sec)', '5 edited stills for the carousel'],
    notes: ['Avoid showing other brand logos', 'Raw footage due 2 days before the deadline'],
  },
};

const chats = new Map<string, MockChatMessage[]>();

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTE).toISOString();

function getChatRecord(campaignId: string, requestId: string) {
  const { campaign, requests } = mockGetCampaignRequests(campaignId);
  const request = requests.find((r) => r.id === requestId && r.status === 'accepted');
  if (!request) throw new ApiError('Chat not found', 404, { message: 'Chat not found' });

  let messages = chats.get(requestId);
  if (!messages) {
    messages = [
      {
        id: `${requestId}_m1`,
        from: 'talent',
        text: `Hi! Excited to work on ${campaign.title}. I’ve gone through the brief.`,
        sentAt: minutesAgo(90),
      },
      {
        id: `${requestId}_m2`,
        from: 'me',
        text: 'Great! Let me know if anything in it needs clearing up.',
        sentAt: minutesAgo(75),
      },
    ];
    chats.set(requestId, messages);
  }
  return { campaign, request, messages };
}

// GET /talent-campaigns/:id/requests/:requestId/chat
export function mockGetCampaignChat(campaignId: string, requestId: string) {
  const { campaign, request, messages } = getChatRecord(campaignId, requestId);
  return {
    campaign: { id: campaign.id, title: campaign.title },
    talent: {
      id: request.talent.id,
      name: request.talent.name,
      role: campaign.role,
      photoUrl: request.talent.photoUrl,
    },
    participants: {
      photoUrls: [photo('brand-manager'), photo('agency-lead')],
      total: 4,
    },
    brief: BRIEFS[campaign.id] ?? DEFAULT_BRIEF,
    messages,
  };
}

// POST /talent-campaigns/:id/requests/:requestId/chat/messages. The talent "replies" straight
// away so the chat can be tried end to end.
export function mockSendChatMessage(
  campaignId: string,
  requestId: string,
  payload: { text: string } | undefined,
) {
  if (!payload) throw new ApiError('Invalid message', 400, { message: 'Invalid message' });
  const { messages } = getChatRecord(campaignId, requestId);
  const now = Date.now();
  const sent: MockChatMessage[] = [
    { id: `msg_${now}`, from: 'me', text: payload.text, sentAt: new Date(now).toISOString() },
    {
      id: `msg_${now}_reply`,
      from: 'talent',
      text: 'Got it, thanks! I’ll keep that in mind.',
      sentAt: new Date(now + 1000).toISOString(),
    },
  ];
  messages.push(...sent);
  return { messages: sent };
}
