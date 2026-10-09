import { useRef, useState } from 'react';

// A pull right after the last one finished is ignored, so tugging the list repeatedly
// doesn't spam the server.
export const PULL_REFRESH_COOLDOWN_MS = 2_000;

type Refetchable = {
  refetch: (options?: { cancelRefetch?: boolean }) => Promise<unknown>;
};

// Props for a RefreshControl (or a FlatList's refreshing/onRefresh) that refetch `queries`.
// Only one refresh runs at a time, and pulls within the cooldown after it are dropped. A pull
// while a query is already fetching in the background joins that fetch instead of restarting it.
// `refreshing` tracks the pull only, so background refetches don't show the spinner.
export function usePullToRefresh(...queries: Refetchable[]) {
  const [refreshing, setRefreshing] = useState(false);
  const busy = useRef(false);
  const lastDone = useRef(0);

  const onRefresh = () => {
    if (busy.current || Date.now() - lastDone.current < PULL_REFRESH_COOLDOWN_MS) return;
    busy.current = true;
    setRefreshing(true);
    void Promise.allSettled(
      queries.map((query) => query.refetch({ cancelRefetch: false })),
    ).finally(() => {
      busy.current = false;
      lastDone.current = Date.now();
      setRefreshing(false);
    });
  };

  return { refreshing, onRefresh };
}
