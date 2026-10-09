// How long fetched data counts as fresh before TanStack Query refetches it in the background.
export const STALE_TIME = {
  // Feeds that move on their own: inbox, chats, notifications.
  live: 30_000,
  // Changed mostly through this app: talents and talent requests.
  owned: 5 * 60_000,
} as const;
