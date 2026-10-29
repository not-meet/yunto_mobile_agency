// Public (bundled) config only — never put secrets in EXPO_PUBLIC_* vars.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

// Shows dev-only tools (e.g. the role switcher) in release builds. Always on in __DEV__.
export const DEV_TOOLS_ENABLED = __DEV__ || process.env.EXPO_PUBLIC_DEV_TOOLS === 'true';

export const API_TIMEOUT_MS = 15_000;

export const STORAGE_KEYS = {
  authToken: 'auth.token',
  refreshToken: 'auth.refreshToken',
} as const;

export const PLACEHOLDER_COLOR = '#BDB8C7';

// Where features that need a bigger screen (Creator AI) live.
export const YUNTO_WEB_URL = 'https://app.yunto.ai';
