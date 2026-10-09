import { z } from 'zod';

import { AGENCY_TYPES, DUMMY_AGENCIES, DUMMY_DELAY_MS, DUMMY_USER } from '@/dummy/auth';

// Auth and agency onboarding. Backed by src/dummy/ for now: each function parses its input and
// output with the same schemas apiRequest will use, so going live only swaps the function bodies.

export const AGENCY_CODE_LENGTH = 5;

// What a member does in the agency. Decides which sections their home shows.
export const roleSchema = z.enum(['admin', 'sales', 'operations']);
export type Role = z.infer<typeof roleSchema>;

export const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.email(),
});
export type User = z.infer<typeof userSchema>;

export const agencySchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  type: z.enum(AGENCY_TYPES),
  code: z.string().length(AGENCY_CODE_LENGTH),
});
export type Agency = z.infer<typeof agencySchema>;
export type AgencyType = Agency['type'];

export const signInRequestSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(1),
});
export type SignInRequest = z.infer<typeof signInRequestSchema>;

export const generateAgencyRequestSchema = z.object({
  name: z.string().trim().min(1),
  location: z.string().trim().min(1),
  type: z.enum(AGENCY_TYPES),
});
export type GenerateAgencyRequest = z.infer<typeof generateAgencyRequestSchema>;

export const connectAgencyRequestSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${AGENCY_CODE_LENGTH}}$`)),
});
export type ConnectAgencyRequest = z.infer<typeof connectAgencyRequestSchema>;

export class AgencyNotFoundError extends Error {
  constructor() {
    super("We couldn't find an agency with that code.");
    this.name = 'AgencyNotFoundError';
  }
}

const wait = () => new Promise((resolve) => setTimeout(resolve, DUMMY_DELAY_MS));

export async function signIn(body: SignInRequest): Promise<User> {
  const { fullName, email } = signInRequestSchema.parse(body);
  await wait();
  return userSchema.parse({ id: DUMMY_USER.id, fullName, email });
}

export async function signInWithGoogle(): Promise<User> {
  await wait();
  return userSchema.parse(DUMMY_USER);
}

export async function generateAgencyCode(body: GenerateAgencyRequest): Promise<Agency> {
  const request = generateAgencyRequestSchema.parse(body);
  await wait();
  const code = String(
    Math.floor(10 ** (AGENCY_CODE_LENGTH - 1) + Math.random() * 9 * 10 ** (AGENCY_CODE_LENGTH - 1)),
  );
  return agencySchema.parse({ id: `agc_${code}`, code, ...request });
}

export async function connectAgency(body: ConnectAgencyRequest): Promise<Agency> {
  const { code } = connectAgencyRequestSchema.parse(body);
  await wait();
  const agency = DUMMY_AGENCIES.find((a) => a.code === code);
  if (!agency) throw new AgencyNotFoundError();
  return agencySchema.parse(agency);
}
