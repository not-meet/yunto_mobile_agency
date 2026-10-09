// Stand-in data for the home dashboard until the API exists. Only src/services/ reads this.

const HOUR_MS = 60 * 60 * 1000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR_MS).toISOString();

export const DUMMY_HOME = {
  pendingLeads: 3,
  leadMatrix: {
    unattended: { count: 3, caption: 'Needs response' },
    newLeads: { count: 4, caption: 'Since yesterday' },
    contacted: { count: 3, caption: '85% active' },
    won: { count: 5, caption: '₹6.55L closed' },
  },
  team: {
    total: 22,
    groups: [
      {
        name: 'Sales Team',
        members: 12,
        active: 10,
        absent: 2,
        workload: {
          day: ['8 Leads', '4 Leads', '7 Leads'],
          week: ['34 Leads', '21 Leads', '29 Leads'],
          month: ['126 Leads', '88 Leads', '97 Leads'],
        },
      },
      {
        name: 'Operations Team',
        members: 10,
        active: 8,
        absent: 2,
        workload: {
          day: ['5 Campaigns'],
          week: ['9 Campaigns', '3 Launches'],
          month: ['18 Campaigns', '7 Launches'],
        },
      },
    ],
  },
  performance: {
    thisMonth: { amount: 840_000, caption: 'Expected this week' },
    lastMonth: { amount: 240_000, caption: 'Closed in September' },
  },
  revenue: {
    achieved: 42_800,
    target: 50_000,
    frequency: 'monthly',
    changePercent: 12.5,
    daysLeft: 12,
  },
  topCreators: [
    {
      id: 'cr_1',
      name: 'Leena Sharma',
      niche: 'Lifestyle & Beauty',
      avatarUrl: 'https://i.pravatar.cc/96?img=47',
      revenue: 42_000,
    },
    {
      id: 'cr_2',
      name: 'Diya Sharma',
      niche: 'Fitness',
      avatarUrl: 'https://i.pravatar.cc/96?img=45',
      revenue: 38_500,
    },
    {
      id: 'cr_3',
      name: 'Kabir Rao',
      niche: 'Tech Reviews',
      avatarUrl: 'https://i.pravatar.cc/96?img=12',
      revenue: 31_200,
    },
  ],
  liveCampaigns: [
    {
      id: 'cmp_1',
      brand: 'Lumina Skin',
      stage: 'Live',
      title: 'Glow Up Diwali Edit',
      progress: 75,
      budget: 125_000,
      deadline: 'Oct 24, 2026',
    },
    {
      id: 'cmp_2',
      brand: 'Aura Fit',
      stage: 'Drafts',
      title: 'Q3 Move Program',
      progress: 40,
      budget: 2_40_000,
      deadline: 'Nov 02, 2026',
    },
    {
      id: 'cmp_3',
      brand: 'Brewly',
      stage: 'Review',
      title: 'Morning Ritual Reels',
      progress: 90,
      budget: 60_000,
      deadline: 'Oct 15, 2026',
    },
  ],
  reminders: [
    { id: 'rem_1', title: 'Approve Lumina drafts', due: 'Due today at 5 PM', done: false },
    { id: 'rem_2', title: 'Send contracts to Meena', due: 'Due yesterday', done: true },
    { id: 'rem_3', title: 'Call Aura Fit about Q4 budget', due: 'Tomorrow, 11 AM', done: false },
  ],
  activity: [
    {
      id: 'act_1',
      title: 'Contract Signed',
      body: 'Elena R. agreed to terms for Lumina.',
      at: hoursAgo(2),
    },
    {
      id: 'act_2',
      title: 'Campaign Launched',
      body: 'Aura Fit Q3 program is now live.',
      at: hoursAgo(5),
    },
    {
      id: 'act_3',
      title: 'Pitch Sent',
      body: 'Sent proposals to 5 new creators.',
      at: hoursAgo(26),
    },
    {
      id: 'act_4',
      title: 'Lead Won',
      body: 'Brewly signed for a 3 month retainer.',
      at: hoursAgo(50),
    },
  ],
};
