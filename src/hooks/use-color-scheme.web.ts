import { useSyncExternalStore } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { usePrefs } from '@/providers/prefs';

const subscribe = () => () => {};

/**
 * To support static rendering, the system value is only read once hydrated on the client;
 * the server snapshot is always 'light'.
 */
export function useColorScheme(): 'light' | 'dark' {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const system = useSystemColorScheme();
  const { themePref } = usePrefs();
  if (!hasHydrated) return 'light';
  if (themePref !== 'system') return themePref;
  return system === 'dark' ? 'dark' : 'light';
}
