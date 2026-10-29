import { mockFindCreator } from '@/dummy/creators';
import { mockGetMembers } from '@/dummy/team';
import { ApiError } from '@/utils/api';
import { addDays, fromDateKey, toDateKey } from '@/utils/dates';

// TEMPORARY fixtures + handlers for the leads screens. Delete with the folder.
//
// Held in memory only: deletes, intents, conversions, deliverables, assignees, notes and
// follow-ups are gone after a restart. Times are fixed at launch, so they don't move on each refetch.

const LAUNCHED_AT = Date.now();
const HOUR_MS = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(LAUNCHED_AT - hours * HOUR_MS).toISOString();
const avatar = (seed: string) => `https://picsum.photos/seed/yunto-lead-${seed}/96/96`;

type MockStatus = 'new' | 'contacted' | 'campaign';
type MockContentType = 'reel' | 'story' | 'post';
type MockRole = 'videographer' | 'editor';

interface MockLead {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: MockStatus;
  needsResponse: boolean;
  contentTypes: MockContentType[];
  receivedAt: string;
  dealType: 'paid' | 'barter';
  budget: number | null;
  brand: string | null;
  phone: string | null;
  // Detail-only.
  campaign: string | null;
  // Given when the lead was added by hand; otherwise made up from the brand.
  email?: string | null;
  website?: string | null;
  ownerIndex: number | null;
  message: string | null;
  // Left out: the brand gave none, so every field is empty.
  requirements?: MockRequirements;
  addOns: MockRole[];
  intent?: 'low' | 'medium' | 'high' | null;
  // Set when the lead is deleted; it's kept, just no longer shown.
  deletedAt?: string;
  // Set when it's converted in this session; the seeded campaigns predate launch.
  convertedAt?: string;
}

type MockPlatform = 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'x';

interface MockRequirements {
  platforms: MockPlatform[];
  niches: string[];
  location: string | null;
  creators: number | null;
  genders: ('female' | 'male' | 'other')[];
  languages: string[];
  ageRanges: ('18-24' | '25-34' | '35-44' | '45+')[];
  followerTiers: ('nano' | 'micro' | 'macro' | 'mega')[];
  dueDate: string | null;
}

const NO_REQUIREMENTS: MockRequirements = {
  platforms: [],
  niches: [],
  location: null,
  creators: null,
  genders: [],
  languages: [],
  ageRanges: [],
  followerTiers: [],
  dueDate: null,
};

// "YYYY-MM-DD", `days` after launch.
const dueIn = (days: number) => toDateKey(addDays(new Date(LAUNCHED_AT), days));

const OWNERS = [
  { name: 'Leena Sharma', avatarUrl: avatar('leena'), phone: '+919811002233' },
  { name: 'Sunil Verma', avatarUrl: avatar('sunil'), phone: '+919822113344' },
  { name: 'Ananya Rao', avatarUrl: null, phone: null },
];

const MANALI_MESSAGE =
  "Hi! We're planning a winter campaign for our new Manali property and would love to collaborate. We are looking for authentic experiences that show the hostel's common spaces, the café and a day trip to Solang. The stay covers three nights for two people, and we can be flexible on dates between December and February.";

const LEADS: MockLead[] = [
  {
    id: 'lead_01',
    name: 'Priya Sharma',
    avatarUrl: avatar('priya'),
    status: 'contacted',
    needsResponse: false,
    contentTypes: ['story', 'reel'],
    receivedAt: hoursAgo(2),
    dealType: 'barter',
    budget: 120_000,
    brand: 'Zostel Trip',
    phone: '+919876543210',
    campaign: 'Winter in Manali',
    ownerIndex: 0,
    message: MANALI_MESSAGE,
    requirements: {
      platforms: ['instagram'],
      niches: ['Travel', 'Lifestyle'],
      location: 'Manali',
      creators: 4,
      genders: ['female', 'male'],
      languages: ['English', 'Hindi'],
      ageRanges: ['18-24', '25-34'],
      followerTiers: ['micro', 'macro'],
      dueDate: dueIn(45),
    },
    addOns: ['videographer', 'editor'],
  },
  {
    id: 'lead_02',
    name: 'Riya Kapoor',
    avatarUrl: avatar('riya'),
    status: 'new',
    needsResponse: true,
    contentTypes: ['reel'],
    receivedAt: hoursAgo(5),
    dealType: 'paid',
    budget: 85_000,
    brand: 'Mamaearth',
    phone: '+919812340001',
    campaign: 'Monsoon Care',
    ownerIndex: 1,
    message:
      'Hey team! We loved the skincare reels from your roster last month. We want two creators for our monsoon hair-care launch, one reel each, posting in the first week of July.\n\nGender: Female Location: Agra\n\nPlatforms\nInstagram',
    requirements: {
      ...NO_REQUIREMENTS,
      platforms: ['instagram'],
      genders: ['female'],
      location: 'Agra',
    },
    addOns: ['editor'],
  },
  {
    id: 'lead_03',
    name: 'Arjun Mehta',
    avatarUrl: null,
    status: 'campaign',
    needsResponse: false,
    contentTypes: ['reel', 'post'],
    receivedAt: hoursAgo(30),
    dealType: 'paid',
    budget: 240_000,
    brand: 'Boat Audio',
    phone: '+919812340002',
    campaign: 'Beats Drop',
    ownerIndex: 0,
    message:
      'Launching the new Airdopes line and need tech creators who can do an honest unboxing plus a gym-use reel.',
    addOns: ['videographer'],
  },
  {
    id: 'lead_04',
    name: 'Sneha Iyer',
    avatarUrl: avatar('sneha'),
    status: 'new',
    needsResponse: true,
    contentTypes: ['story', 'post'],
    receivedAt: hoursAgo(9),
    dealType: 'barter',
    budget: 40_000,
    brand: 'Sugar Cosmetics',
    phone: null,
    campaign: null,
    ownerIndex: null,
    message: null,
    addOns: [],
  },
  {
    id: 'lead_05',
    name: 'Kabir Singh',
    avatarUrl: avatar('kabir'),
    status: 'campaign',
    needsResponse: false,
    contentTypes: ['reel'],
    receivedAt: hoursAgo(52),
    dealType: 'paid',
    budget: 150_000,
    brand: 'Lenskart',
    phone: '+919812340003',
    campaign: 'Blu Lens Week',
    ownerIndex: 1,
    message:
      'Looking for 3 lifestyle creators to feature our blue-light lenses in a work-from-café reel.',
    requirements: {
      platforms: ['instagram', 'youtube'],
      niches: ['Lifestyle', 'Tech'],
      location: 'Bengaluru',
      creators: 3,
      genders: [],
      languages: ['English'],
      ageRanges: ['25-34'],
      followerTiers: ['micro'],
      dueDate: dueIn(12),
    },
    addOns: ['editor'],
  },
  {
    id: 'lead_06',
    name: 'Meera Nair',
    avatarUrl: avatar('meera'),
    status: 'contacted',
    needsResponse: false,
    contentTypes: ['reel', 'story'],
    receivedAt: hoursAgo(28),
    dealType: 'paid',
    budget: 95_000,
    brand: 'Plum',
    phone: '+919812340004',
    campaign: 'Clean Beauty',
    ownerIndex: 2,
    message:
      'We want a GRWM reel with our new vitamin C range. Open to your suggestions on creators.',
    requirements: {
      platforms: ['instagram'],
      niches: ['Beauty'],
      location: 'Agra',
      creators: 15,
      genders: ['female'],
      languages: ['English'],
      ageRanges: ['18-24', '25-34'],
      followerTiers: ['micro', 'macro'],
      dueDate: null,
    },
    addOns: [],
  },
  {
    id: 'lead_07',
    name: 'Rohan Gupta',
    avatarUrl: null,
    status: 'new',
    needsResponse: true,
    contentTypes: ['post'],
    receivedAt: hoursAgo(0.5),
    dealType: 'paid',
    budget: null,
    brand: 'The Souled Store',
    phone: '+919812340005',
    campaign: null,
    ownerIndex: null,
    message:
      'Hi, can you share your rate card for static posts? We have a merch drop next month.\n\nGender: Male Location: Mumbai\n\nPlatforms\nInstagram, YouTube',
    addOns: [],
  },
  {
    id: 'lead_08',
    name: 'Ishita Bose',
    avatarUrl: avatar('ishita'),
    status: 'campaign',
    needsResponse: false,
    contentTypes: ['reel', 'story'],
    receivedAt: hoursAgo(96),
    dealType: 'barter',
    budget: 60_000,
    brand: 'Taj Hotels',
    phone: '+919812340006',
    campaign: 'Staycation Edit',
    ownerIndex: 0,
    message:
      'Two-night staycation at Taj Lands End for a couple creator. Reel and three stories.\n\nLocation: Mumbai\n\nPlatforms\nInstagram',
    requirements: { ...NO_REQUIREMENTS, platforms: ['instagram'], location: 'Mumbai', creators: 1 },
    addOns: ['videographer'],
  },
  {
    id: 'lead_09',
    name: 'Dev Malhotra',
    avatarUrl: avatar('dev'),
    status: 'new',
    needsResponse: false,
    contentTypes: ['reel'],
    receivedAt: hoursAgo(20),
    dealType: 'paid',
    budget: 70_000,
    brand: 'Bombay Shaving Co',
    phone: '+919812340007',
    campaign: 'No Shave November',
    ownerIndex: 1,
    message: 'Grooming creators for a November campaign, humour-led reels preferred.',
    addOns: ['editor'],
  },
  {
    id: 'lead_10',
    name: 'Tanvi Shah',
    avatarUrl: null,
    status: 'contacted',
    needsResponse: false,
    contentTypes: ['story'],
    receivedAt: hoursAgo(75),
    dealType: 'paid',
    budget: 30_000,
    brand: 'Nykaa',
    phone: null,
    campaign: 'Pink Friday',
    ownerIndex: 2,
    message: null,
    addOns: [],
  },
  {
    id: 'lead_11',
    name: 'Aman Khanna',
    avatarUrl: avatar('aman'),
    status: 'campaign',
    needsResponse: false,
    contentTypes: ['reel', 'post'],
    receivedAt: hoursAgo(130),
    dealType: 'paid',
    budget: 180_000,
    brand: 'Myntra',
    phone: '+919812340008',
    campaign: 'End of Reason Sale',
    ownerIndex: 0,
    message: 'Fashion haul reels for EORS. Need 5 creators across tiers.',
    addOns: ['videographer', 'editor'],
  },
  {
    id: 'lead_12',
    name: 'Nisha Verma',
    avatarUrl: avatar('nisha'),
    status: 'campaign',
    needsResponse: false,
    contentTypes: ['story'],
    receivedAt: hoursAgo(170),
    dealType: 'barter',
    budget: 25_000,
    brand: 'Wow Skin',
    phone: '+919812340009',
    campaign: 'Onion Oil Relaunch',
    ownerIndex: 2,
    message: 'Product seeding for our relaunch, stories only.',
    addOns: [],
  },
];

// PUT /leads/:id/requirements. Replaces them whole. Its campaign shares them.
export function mockSetLeadRequirements(id: string, payload: MockRequirements | undefined) {
  if (!payload)
    throw new ApiError('Invalid requirements', 400, { message: 'Invalid requirements' });
  const lead = findLead(id);
  lead.requirements = payload;
  return { lead: toDetails(lead) };
}

// PUT /leads/:id/assignees. Teammate ids, the first the primary; seeded by the lead's place in
// the list until first changed.
const SEED_ASSIGNEES = [['parul'], [], ['karan', 'neha'], ['priya']];
const assigneeRecords = new Map<string, string[]>();

function getAssigneeIds(lead: MockLead): string[] {
  return (
    assigneeRecords.get(lead.id) ??
    SEED_ASSIGNEES[LEADS.indexOf(lead) % SEED_ASSIGNEES.length] ??
    []
  );
}

function toAssignees(lead: MockLead) {
  const members = mockGetMembers().members;
  return getAssigneeIds(lead).flatMap((id) => {
    const member = members.find((m) => m.id === id);
    return member ? [{ id: member.id, name: member.name, avatarUrl: member.avatarUrl }] : [];
  });
}

const DELIVERABLES: Record<MockContentType, { quantity: number; note: string }> = {
  reel: { quantity: 1, note: 'Pending shoot' },
  story: { quantity: 2, note: 'Pending shoot' },
  post: { quantity: 1, note: 'Awaiting brief' },
};

const AGENCY_CUT = 0.2;

// GET/POST /leads/:id/deliverables, PUT and DELETE /leads/:id/deliverables/:deliverableId. A
// lead's campaign shares them. Seeded from what the brand asked for until first changed.

type MockDeliverableType = 'reel' | 'post' | 'story' | 'ugc';
interface MockDeliverable {
  id: string;
  type: MockDeliverableType;
  title: string;
  note: string | null;
  quantity: number;
}

const DELIVERABLE_NAMES: Record<MockDeliverableType, [string, string]> = {
  reel: ['Reel', 'Reels'],
  post: ['Post', 'Posts'],
  story: ['Story', 'Stories'],
  ugc: ['UGC Ad', 'UGC Ads'],
};

// "2 Reels".
function deliverableTitle(type: MockDeliverableType, quantity: number) {
  const [one, many] = DELIVERABLE_NAMES[type];
  return `${quantity} ${quantity === 1 ? one : many}`;
}

const deliverableRecords = new Map<string, MockDeliverable[]>();

function getDeliverables(lead: MockLead): MockDeliverable[] {
  let records = deliverableRecords.get(lead.id);
  if (!records) {
    records = lead.contentTypes.map((type, i) => {
      const { quantity, note } = DELIVERABLES[type];
      return {
        id: `${lead.id}_dlv_${i + 1}`,
        type,
        title: deliverableTitle(type, quantity),
        note,
        quantity,
      };
    });
    deliverableRecords.set(lead.id, records);
  }
  return records;
}

function findLead(id: string): MockLead {
  const lead = LEADS.find((l) => l.id === id && !l.deletedAt);
  if (!lead) throw new ApiError('Lead not found', 404, { message: 'Lead not found' });
  return lead;
}

function toListItem(lead: MockLead) {
  const {
    id,
    name,
    avatarUrl,
    status,
    needsResponse,
    contentTypes,
    receivedAt,
    dealType,
    budget,
    brand,
    phone,
  } = lead;
  return {
    id,
    name,
    avatarUrl,
    status,
    needsResponse,
    contentTypes,
    receivedAt,
    dealType,
    budget,
    brand,
    phone,
  };
}

function toDetails(lead: MockLead) {
  const slug = (lead.brand ?? lead.name).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const fee = lead.budget === null ? null : Math.round(lead.budget * AGENCY_CUT);
  return {
    ...toListItem(lead),
    campaign: lead.campaign,
    owner: lead.ownerIndex === null ? null : (OWNERS[lead.ownerIndex] ?? null),
    email: lead.email !== undefined ? lead.email : lead.brand ? `collabs@${slug}.com` : null,
    website: lead.website !== undefined ? lead.website : lead.brand ? `${slug}.com` : null,
    message: lead.message,
    requirements: lead.requirements ?? NO_REQUIREMENTS,
    assignees: toAssignees(lead),
    deliverables: getDeliverables(lead),
    addOns: lead.addOns,
    campaignId: lead.status === 'campaign' ? mockCampaignIdFor(lead.id) : null,
    intent: lead.intent ?? null,
    payment: {
      amount: lead.budget,
      agencyFee: fee,
      payout: lead.budget === null || fee === null ? null : lead.budget - fee,
    },
  };
}

// One campaign per lead, so its id follows from the lead's.
export const mockCampaignIdFor = (leadId: string) => `cmp_${leadId}`;

// For the campaigns fixtures: when the lead was converted, or null for a seeded campaign.
export function mockLeadConvertedAt(id: string): string | null {
  return findLead(id).convertedAt ?? null;
}

// GET /leads
export function mockGetLeads() {
  const leads = LEADS.filter((l) => !l.deletedAt).sort(
    (a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt),
  );
  return { leads: leads.map(toListItem) };
}

// GET /leads/:id
export function mockGetLead(id: string) {
  return { lead: toDetails(findLead(id)) };
}

// POST /leads/:id/convert. Converting twice is fine (idempotent).
export function mockConvertLead(id: string) {
  const lead = findLead(id);
  if (lead.status !== 'campaign') {
    lead.status = 'campaign';
    lead.needsResponse = false;
    lead.convertedAt = new Date().toISOString();
    getActivityRecord(id).activity.unshift({
      id: `lact_${Date.now()}`,
      type: 'converted',
      title: `Converted to a campaign`,
      at: new Date().toISOString(),
    });
  }
  return { lead: toDetails(lead) };
}

// POST /leads. The lead joins the list as new, unassigned and with no message.

interface MockNewLead {
  campaignType: 'paid' | 'barter';
  platforms: MockPlatform[];
  niches: string[];
  brand: string;
  website: string | null;
  email: string | null;
  contactName: string;
  phone: string | null;
  budget: number | null;
  agencyFee?: number | null;
  productShipment?: 'creator_buys' | 'brand_ships' | null;
  influencers: number | null;
  deliverables: string | null;
}

export function mockCreateLead(payload: MockNewLead | undefined) {
  if (!payload) throw new ApiError('Invalid lead', 400, { message: 'Invalid lead' });
  const createdAt = new Date().toISOString();
  // "https://www.zostel.com/x" → "zostel.com".
  const website = payload.website
    ? (/^https:\/\/(?:www\.)?([^/?#:]+)/.exec(payload.website)?.[1] ?? null)
    : null;
  const lead: MockLead = {
    id: `lead_${Date.now()}`,
    name: payload.contactName,
    avatarUrl: null,
    status: 'new',
    needsResponse: false,
    contentTypes: [],
    receivedAt: createdAt,
    dealType: payload.campaignType,
    budget: payload.budget,
    brand: payload.brand,
    phone: payload.phone,
    campaign: null,
    ownerIndex: null,
    message: null,
    // What the Add Lead form asked; the rest is filled in on the lead.
    requirements: {
      ...NO_REQUIREMENTS,
      platforms: payload.platforms,
      niches: payload.niches,
      creators: payload.influencers,
    },
    addOns: [],
    email: payload.email,
    website,
  };
  LEADS.unshift(lead);
  return {
    lead: {
      id: lead.id,
      createdAt,
      campaignType: payload.campaignType,
      platforms: payload.platforms,
      niches: payload.niches,
      brand: payload.brand,
      website,
      email: payload.email,
      contactName: payload.contactName,
      phone: payload.phone,
      budget: payload.budget,
      agencyFee: payload.agencyFee ?? null,
      productShipment: payload.productShipment ?? null,
      influencers: payload.influencers,
      deliverables: payload.deliverables,
    },
  };
}

// DELETE /leads/:id. Marks the lead deleted rather than dropping it.
export function mockDeleteLead(id: string) {
  findLead(id).deletedAt = new Date().toISOString();
  return { ok: true as const };
}

// PUT /leads/:id/intent. Judging a new lead's intent means it's been contacted.
export function mockSetLeadIntent(
  id: string,
  payload: { intent: 'low' | 'medium' | 'high' } | undefined,
) {
  if (!payload) throw new ApiError('Invalid intent', 400, { message: 'Invalid intent' });
  const lead = findLead(id);
  if (lead.intent !== payload.intent) {
    lead.intent = payload.intent;
    if (lead.status === 'new') lead.status = 'contacted';
    getActivityRecord(id).activity.unshift({
      id: `lact_${Date.now()}`,
      type: 'intent',
      title: `Intent → ${payload.intent}`,
      at: new Date().toISOString(),
    });
  }
  return { lead: toDetails(lead) };
}

// PUT /leads/:id/assignees
export function mockSetLeadAssignees(id: string, payload: { memberIds: string[] } | undefined) {
  if (!payload) throw new ApiError('Bad request', 400, { message: 'Bad request' });
  const lead = findLead(id);
  assigneeRecords.set(lead.id, payload.memberIds);
  return { lead: toDetails(lead) };
}

// POST /leads/:id/deliverables. One deliverable per type, e.g. "2 Reels".
export function mockAddLeadDeliverables(
  id: string,
  payload:
    | {
        platform: 'instagram';
        items: { type: MockDeliverableType; quantity: number }[];
        title: string | null;
      }
    | undefined,
) {
  if (!payload) throw new ApiError('Bad request', 400, { message: 'Bad request' });
  const lead = findLead(id);
  const records = getDeliverables(lead);
  const now = Date.now();
  payload.items.forEach(({ type, quantity }, i) => {
    records.push({
      id: `${lead.id}_dlv_${now}_${i}`,
      type,
      title: deliverableTitle(type, quantity),
      note: payload.title ?? 'Instagram',
      quantity,
    });
  });
  return { lead: toDetails(lead) };
}

function findDeliverable(lead: MockLead, deliverableId: string) {
  const deliverable = getDeliverables(lead).find((d) => d.id === deliverableId);
  if (!deliverable) {
    throw new ApiError('Deliverable not found', 404, { message: 'Deliverable not found' });
  }
  return deliverable;
}

// PUT /leads/:id/deliverables/:deliverableId
export function mockUpdateLeadDeliverable(
  id: string,
  deliverableId: string,
  payload: { quantity: number; title: string | null } | undefined,
) {
  if (!payload) throw new ApiError('Bad request', 400, { message: 'Bad request' });
  const lead = findLead(id);
  const deliverable = findDeliverable(lead, deliverableId);
  deliverable.quantity = payload.quantity;
  deliverable.title = deliverableTitle(deliverable.type, payload.quantity);
  deliverable.note = payload.title;
  return { lead: toDetails(lead) };
}

// DELETE /leads/:id/deliverables/:deliverableId
export function mockRemoveLeadDeliverable(id: string, deliverableId: string) {
  const lead = findLead(id);
  findDeliverable(lead, deliverableId);
  deliverableRecords.set(
    lead.id,
    getDeliverables(lead).filter((d) => d.id !== deliverableId),
  );
  return { lead: toDetails(lead) };
}

// GET /leads/:id/activity, POST /leads/:id/notes and /leads/:id/follow-ups. Every lead starts
// from the same seed.

type MockFollowUpUpdate = 'discussion' | 'negotiations' | 'signing';
interface MockActivity {
  notes: { id: string; text: string; createdAt: string }[];
  activity: {
    id: string;
    type: 'reminder' | 'follow-up' | 'call' | 'contacted' | 'converted' | 'intent';
    title: string;
    at: string;
  }[];
  followUps: { date: string; update: MockFollowUpUpdate }[];
}

const FOLLOW_UP_LABELS: Record<MockFollowUpUpdate, string> = {
  discussion: 'Discussion',
  negotiations: 'Negotiations',
  signing: 'Signing',
};

// `days` from launch day (negative for the past), at a fixed wall-clock time.
function launchDayAt(days: number, hours: number, minutes = 0) {
  const date = addDays(new Date(LAUNCHED_AT), days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const activityRecords = new Map<string, MockActivity>();

function seedActivity(): MockActivity {
  return {
    notes: [
      {
        id: 'note_03',
        text: 'Asked for the rate card again. They want to see story views from the last month before confirming.',
        createdAt: launchDayAt(0, 9, 30).toISOString(),
      },
      {
        id: 'note_02',
        text: 'Call went well. They are flexible on dates between December and February, prefer a weekday check-in. The stay covers three nights for two people, travel is on us.',
        createdAt: launchDayAt(-1, 13, 40).toISOString(),
      },
      {
        id: 'note_01',
        text: 'First reply sent with the media kit.',
        createdAt: launchDayAt(-3, 18, 5).toISOString(),
      },
    ],
    activity: [
      {
        id: 'lact_04',
        type: 'follow-up',
        title: 'Follow-up scheduled',
        at: launchDayAt(0, 14).toISOString(),
      },
      {
        id: 'lact_03',
        type: 'reminder',
        title: 'Reminder for payment status',
        at: launchDayAt(0, 10).toISOString(),
      },
      { id: 'lact_02', type: 'call', title: 'Call', at: launchDayAt(-1, 13, 15).toISOString() },
      {
        id: 'lact_01',
        type: 'contacted',
        title: 'Sunil Verma contacted',
        at: launchDayAt(-1, 11).toISOString(),
      },
    ],
    followUps: [{ date: toDateKey(new Date(LAUNCHED_AT)), update: 'discussion' }],
  };
}

function getActivityRecord(id: string): MockActivity {
  findLead(id);
  let record = activityRecords.get(id);
  if (!record) {
    record = seedActivity();
    activityRecords.set(id, record);
  }
  return record;
}

// The soonest follow-up from today on ("YYYY-MM-DD" sorts as text).
function nextFollowUp({ followUps }: MockActivity) {
  const today = toDateKey(new Date());
  return (
    followUps.filter((f) => f.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  );
}

export function mockGetActivity(id: string) {
  const record = getActivityRecord(id);
  return { notes: record.notes, activity: record.activity, followUp: nextFollowUp(record) };
}

export function mockAddNote(id: string, payload: { text: string } | undefined) {
  if (!payload) throw new ApiError('Invalid note', 400, { message: 'Invalid note' });
  const record = getActivityRecord(id);
  const note = {
    id: `note_${Date.now()}`,
    text: payload.text,
    createdAt: new Date().toISOString(),
  };
  record.notes.unshift(note);
  return { note };
}

// The timeline entry lands on the follow-up's day, at the time it was scheduled.
export function mockScheduleFollowUp(
  id: string,
  payload: { date: string; update: MockFollowUpUpdate } | undefined,
) {
  if (!payload) throw new ApiError('Invalid follow-up', 400, { message: 'Invalid follow-up' });
  const record = getActivityRecord(id);
  const at = fromDateKey(payload.date);
  const now = new Date();
  at.setHours(now.getHours(), now.getMinutes(), 0, 0);
  const activity = {
    id: `lact_${Date.now()}`,
    type: 'follow-up' as const,
    title: `Follow-up: ${FOLLOW_UP_LABELS[payload.update]}`,
    at: at.toISOString(),
  };
  record.followUps.push(payload);
  record.activity.unshift(activity);
  return { followUp: nextFollowUp(record) ?? payload, activity };
}

// GET /leads/:id/creators(/:creatorId), POST /leads/:id/creators (add), /status and /remove.
// New leads start with none; every other lead starts from the same five of the pool, picked by
// its place in the list.

type MockCreatorStatus = 'pending' | 'shortlisted' | 'done';
type MockCreatorActivityType = 'added' | 'brief' | 'message' | 'shortlisted';

interface MockCreator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  platform: 'instagram' | 'youtube' | 'UNKNOWN';
  niche: string;
  status: MockCreatorStatus;
  followers: number;
  avgViews: number;
  engagementRate: number;
  // Detail-only.
  location: string | null;
  budget: number | null;
  followersGrowth: number | null;
  engagementChange: number | null;
  // How many of the lead's deliverables are live.
  delivered: number;
  activity: {
    id: string;
    type: MockCreatorActivityType;
    title: string;
    detail: string | null;
    at: string;
  }[];
}

const creatorAvatar = (seed: string) => `https://picsum.photos/seed/yunto-creator-${seed}/96/96`;

const CREATOR_POOL: Omit<MockCreator, 'activity'>[] = [
  {
    id: 'aarav',
    name: 'Aarav Mehta',
    handle: '@aarav.travels',
    avatarUrl: creatorAvatar('aarav'),
    platform: 'instagram',
    niche: 'Travel',
    status: 'shortlisted',
    followers: 1_200_000,
    avgViews: 840_000,
    engagementRate: 4.2,
    location: 'Mumbai, MH',
    budget: 45_000,
    followersGrowth: 8.4,
    engagementChange: 0.6,
    delivered: 1,
  },
  {
    id: 'sana',
    name: 'Sana Qureshi',
    handle: '@sana.styles',
    avatarUrl: creatorAvatar('sana'),
    platform: 'instagram',
    niche: 'Fashion',
    status: 'pending',
    followers: 486_000,
    avgViews: 212_000,
    engagementRate: 5.1,
    location: 'Delhi, DL',
    budget: 28_000,
    followersGrowth: 3.2,
    engagementChange: -0.4,
    delivered: 0,
  },
  {
    id: 'kabir',
    name: 'Kabir Rao',
    handle: '@kabirvlogs',
    avatarUrl: creatorAvatar('kabir'),
    platform: 'youtube',
    niche: 'Lifestyle',
    status: 'done',
    followers: 2_400_000,
    avgViews: 1_100_000,
    engagementRate: 3.8,
    location: 'Bengaluru, KA',
    budget: 90_000,
    followersGrowth: 1.9,
    engagementChange: 0.2,
    delivered: 3,
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    handle: '@meera.eats',
    avatarUrl: creatorAvatar('meera'),
    platform: 'instagram',
    niche: 'Food',
    status: 'pending',
    followers: 312_000,
    avgViews: 140_000,
    engagementRate: 6.3,
    location: 'Chennai, TN',
    budget: 18_000,
    followersGrowth: 12.1,
    engagementChange: 1.1,
    delivered: 0,
  },
  {
    id: 'rohan',
    name: 'Rohan Das',
    handle: '@rohan.fits',
    avatarUrl: null,
    platform: 'youtube',
    niche: 'Fitness',
    status: 'shortlisted',
    followers: 768_000,
    avgViews: 390_000,
    engagementRate: 4.7,
    location: null,
    budget: null,
    followersGrowth: null,
    engagementChange: null,
    delivered: 0,
  },
  {
    id: 'tara',
    name: 'Tara Sen',
    handle: '@tara.glow',
    avatarUrl: creatorAvatar('tara'),
    platform: 'instagram',
    niche: 'Beauty',
    status: 'pending',
    followers: 954_000,
    avgViews: 505_000,
    engagementRate: 4.9,
    location: 'Kolkata, WB',
    budget: 36_000,
    followersGrowth: 5.6,
    engagementChange: 0.3,
    delivered: 0,
  },
  {
    id: 'naina',
    name: 'Naina Joshi',
    handle: '@naina.makes',
    avatarUrl: creatorAvatar('naina'),
    platform: 'instagram',
    niche: 'Crafts & DIY',
    status: 'pending',
    followers: 128_000,
    avgViews: 64_000,
    engagementRate: 7.4,
    location: 'Jaipur, RJ',
    budget: 18_000,
    followersGrowth: 9.2,
    engagementChange: 1.1,
    delivered: 0,
  },
  {
    id: 'arjun',
    name: 'Arjun Nair',
    handle: '@arjun.lens',
    avatarUrl: creatorAvatar('arjun'),
    platform: 'instagram',
    niche: 'Artists & Films',
    status: 'shortlisted',
    followers: 98_000,
    avgViews: 41_000,
    engagementRate: 6.8,
    location: 'Kochi, KL',
    budget: 14_000,
    followersGrowth: 4.3,
    engagementChange: 0.8,
    delivered: 0,
  },
  {
    id: 'zoya',
    name: 'Zoya Khan',
    handle: '@zoya.paints',
    avatarUrl: creatorAvatar('zoya'),
    platform: 'instagram',
    niche: 'Crafts & DIY',
    status: 'pending',
    followers: 42_000,
    avgViews: 18_000,
    engagementRate: 8.2,
    location: 'Lucknow, UP',
    budget: null,
    followersGrowth: 11.5,
    engagementChange: null,
    delivered: 0,
  },
];

// Enough that most leads have someone in every tier.
const CREATORS_PER_LEAD = 8;

const CREATOR_DELIVERABLES: Record<MockContentType, string> = {
  reel: '1x Instagram Reel',
  story: '2x Instagram Stories — Discount Code',
  post: '1x Instagram Post',
};

const CREATOR_ADD_ONS: Record<MockRole, { title: string; price: number }> = {
  videographer: { title: 'Videographer On-Site Shoot', price: 8000 },
  editor: { title: 'Editor Minimal Style', price: 4500 },
};

const creatorRecords = new Map<string, MockCreator[]>();

function seedCreatorActivity(creator: Omit<MockCreator, 'activity'>) {
  const first = creator.name.split(' ')[0] ?? creator.name;
  const activity: MockCreator['activity'] = [
    {
      id: `${creator.id}_act_1`,
      type: 'added',
      title: 'Added to lead',
      detail: `${first} was pitched to the brand`,
      at: hoursAgo(96),
    },
    {
      id: `${creator.id}_act_2`,
      type: 'message',
      title: 'Rate card shared',
      detail: `${first} sent their rates and media kit`,
      at: hoursAgo(70),
    },
    {
      id: `${creator.id}_act_3`,
      type: 'brief',
      title: 'Brief sent',
      detail: 'Campaign brief and references shared',
      at: hoursAgo(46),
    },
  ];
  if (creator.status !== 'pending') {
    activity.push({
      id: `${creator.id}_act_4`,
      type: 'shortlisted',
      title: 'Shortlisted',
      detail: 'Brand approved the creator',
      at: hoursAgo(20),
    });
  }
  return activity.reverse();
}

function getCreatorRecords(leadId: string): MockCreator[] {
  const index = LEADS.indexOf(findLead(leadId));
  let records = creatorRecords.get(leadId);
  if (!records) {
    const start = index % CREATOR_POOL.length;
    records =
      LEADS[index]?.status === 'new'
        ? []
        : [...CREATOR_POOL.slice(start), ...CREATOR_POOL.slice(0, start)]
            .slice(0, CREATORS_PER_LEAD)
            .map((base) => ({ ...base, activity: seedCreatorActivity(base) }));
    creatorRecords.set(leadId, records);
  }
  return records;
}

function findCreator(leadId: string, creatorId: string): MockCreator {
  const creator = getCreatorRecords(leadId).find((c) => c.id === creatorId);
  if (!creator) throw new ApiError('Creator not found', 404, { message: 'Creator not found' });
  return creator;
}

function toCreatorListItem(creator: MockCreator) {
  const { id, name, handle, avatarUrl, platform, niche, status } = creator;
  const { followers, avgViews, engagementRate } = creator;
  // Who manages them and their number are the roster's.
  const { managedBy, phone } = mockFindCreator(id);
  return {
    managedBy,
    phone,
    id,
    name,
    handle,
    avatarUrl,
    platform,
    niche,
    status,
    followers,
    avgViews,
    engagementRate,
  };
}

function toCreatorDetails(lead: MockLead, creator: MockCreator) {
  const deliverables = lead.contentTypes.map((type, i) => {
    const done = creator.status === 'done' || i < creator.delivered;
    return {
      id: `${creator.id}_dlv_${i + 1}`,
      title: CREATOR_DELIVERABLES[type],
      date: toDateKey(addDays(new Date(LAUNCHED_AT), done ? -(2 + i) : 3 + i * 2)),
      done,
    };
  });
  return {
    ...toCreatorListItem(creator),
    location: creator.location,
    campaign: lead.brand ?? lead.campaign,
    deadline: creator.budget === null ? null : toDateKey(addDays(new Date(LAUNCHED_AT), 14)),
    budget: creator.budget,
    analytics: {
      followersGrowth: creator.followersGrowth,
      engagementChange: creator.engagementChange,
      campaignReach: deliverables.some((d) => d.done) ? Math.round(creator.avgViews * 2.5) : null,
    },
    deliverables,
    addOns: lead.addOns.map((role) => ({
      id: `${creator.id}_addon_${role}`,
      role,
      ...CREATOR_ADD_ONS[role],
    })),
    activity: creator.activity,
  };
}

export function mockGetLeadCreators(leadId: string) {
  return { creators: getCreatorRecords(leadId).map(toCreatorListItem) };
}

export function mockGetLeadCreator(leadId: string, creatorId: string) {
  return { creator: toCreatorDetails(findLead(leadId), findCreator(leadId, creatorId)) };
}

// Roster creators join at the end as pending. Adding one already on the lead is a no-op
// (idempotent). Returns the lead's creators as they are now.
export function mockAddLeadCreators(leadId: string, payload: { creatorIds: string[] } | undefined) {
  if (!payload) throw new ApiError('Invalid update', 400, { message: 'Invalid update' });
  const records = getCreatorRecords(leadId);
  for (const creatorId of payload.creatorIds) {
    if (records.some((c) => c.id === creatorId)) continue;
    const roster = mockFindCreator(creatorId);
    records.push({
      id: roster.id,
      name: roster.name,
      handle: roster.handle,
      avatarUrl: roster.avatarUrl,
      // Leads only badge these two.
      platform:
        roster.platform === 'instagram' || roster.platform === 'youtube'
          ? roster.platform
          : 'UNKNOWN',
      niche: roster.niche,
      status: 'pending',
      followers: roster.followers,
      avgViews: roster.avgViews,
      engagementRate: roster.engagementRate,
      location: roster.location,
      budget: null,
      followersGrowth: null,
      engagementChange: null,
      delivered: 0,
      activity: [
        {
          id: `${roster.id}_act_${Date.now()}`,
          type: 'added',
          title: 'Added to lead',
          detail: 'Added by you',
          at: new Date().toISOString(),
        },
      ],
    });
  }
  return { creators: records.map(toCreatorListItem) };
}

const CREATOR_STATUS_TITLES: Record<MockCreatorStatus, string> = {
  pending: 'Moved back to pending',
  shortlisted: 'Shortlisted',
  done: 'Marked done',
};

// Setting the status a creator already has is a no-op (idempotent).
export function mockSetLeadCreatorStatus(
  leadId: string,
  payload: { creatorIds: string[]; status: MockCreatorStatus } | undefined,
) {
  if (!payload) throw new ApiError('Invalid update', 400, { message: 'Invalid update' });
  const creators = payload.creatorIds.map((id) => findCreator(leadId, id));
  for (const creator of creators) {
    if (creator.status === payload.status) continue;
    creator.status = payload.status;
    creator.activity.unshift({
      id: `${creator.id}_act_${Date.now()}`,
      type: payload.status === 'pending' ? 'added' : 'shortlisted',
      title: CREATOR_STATUS_TITLES[payload.status],
      detail: 'Updated by you',
      at: new Date().toISOString(),
    });
  }
  return { creators: creators.map(toCreatorListItem) };
}

export function mockRemoveLeadCreators(
  leadId: string,
  payload: { creatorIds: string[] } | undefined,
) {
  if (!payload) throw new ApiError('Invalid update', 400, { message: 'Invalid update' });
  const records = getCreatorRecords(leadId);
  creatorRecords.set(
    leadId,
    records.filter((c) => !payload.creatorIds.includes(c.id)),
  );
  return { ok: true as const };
}
