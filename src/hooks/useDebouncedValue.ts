import { useEffect, useState } from 'react';

// `value`, but only once it has stopped changing for `delayMs`: a search box can update on
// every keystroke while the request waits for a pause in typing.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
