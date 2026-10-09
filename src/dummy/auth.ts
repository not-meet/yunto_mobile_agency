// Stand-in data for the onboarding flow until the API exists. Only src/services/ reads this,
// so swapping in real endpoints won't touch any screen.

export const DUMMY_DELAY_MS = 800;

export const DUMMY_USER = {
  id: 'usr_1',
  fullName: 'Aarav Mehta',
  email: 'aarav@stellaragency.com',
};

export const AGENCY_TYPES = [
  'Creator / Influencer Agency',
  'Talent Management',
  'Marketing Agency',
  'Production House',
  'PR Agency',
] as const;

// Codes that "Enter Agency Code" accepts. Try 55678.
export const DUMMY_AGENCIES = [
  {
    id: 'agc_1',
    name: 'Stellar Creator Agency',
    location: 'Mumbai, India',
    type: 'Creator / Influencer Agency',
    code: '55678',
  },
  {
    id: 'agc_2',
    name: 'Northwind Talent',
    location: 'Bengaluru, India',
    type: 'Talent Management',
    code: '12345',
  },
] as const;
