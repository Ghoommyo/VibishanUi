import { useColorScheme as useSystemColorScheme } from 'react-native';

import { usePrefs } from '@/providers/prefs';

/** The scheme in effect: the user's override from Settings, otherwise the system scheme. */
export function useColorScheme(): 'light' | 'dark' {
  const system = useSystemColorScheme();
  const { themePref } = usePrefs();
  if (themePref !== 'system') return themePref;
  return system === 'dark' ? 'dark' : 'light';
}
