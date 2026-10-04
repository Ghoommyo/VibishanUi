import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  /** Refetch on this interval while the screen is focused, in ms. */
  pollMs?: number;
};

/**
 * Loads data from the API layer. Refetches whenever the screen gains focus, and optionally polls,
 * so screens pick up changes made elsewhere (e.g. by another account) without manual refresh.
 * `key` identifies what is being fetched (e.g. a room id); changing it triggers a refetch.
 */
export function useApi<T>(fetcher: () => Promise<T>, key: string, { pollMs }: Options = {}) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  // Declared before useFocusEffect so the latest fetcher is in place when it runs.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // Bumped on each request so a slow, stale response can't overwrite a newer one.
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const result = await fetcherRef.current();
      if (id === requestId.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetch();
      if (!pollMs) return;
      const timer = setInterval(refetch, pollMs);
      return () => clearInterval(timer);
      // `key` is intentionally a dependency: the fetcher closes over the values it names.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch, pollMs, key]),
  );

  return { data, error, loading, refetch, setData };
}
