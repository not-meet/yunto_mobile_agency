// Public (bundled) config only — never put secrets in EXPO_PUBLIC_* vars.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export const API_TIMEOUT_MS = 15_000;

export const STORAGE_KEYS = {
  authToken: 'auth.token',
  refreshToken: 'auth.refreshToken',
} as const;
