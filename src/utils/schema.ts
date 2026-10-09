import { z } from 'zod';

// Shared schema helpers for the services.

export const UNKNOWN = 'UNKNOWN' as const;

// A response enum that survives new server values: anything outside `values` parses as
// "UNKNOWN" instead of failing the whole response. Request enums stay strict (plain z.enum).
export function tolerantEnum<const T extends readonly string[]>(values: T) {
  type Value = T[number] | typeof UNKNOWN;
  const all: [Value, ...Value[]] = [UNKNOWN, ...values];
  return z.enum(all).catch(UNKNOWN);
}
