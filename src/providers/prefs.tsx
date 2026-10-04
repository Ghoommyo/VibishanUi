import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

export type ThemePref = 'system' | 'light' | 'dark';

const KEY = 'vibishan.prefs.theme';

type PrefsContextValue = {
  themePref: ThemePref;
  setThemePref: (pref: ThemePref) => void;
};

const PrefsContext = createContext<PrefsContextValue>({ themePref: 'system', setThemePref: () => {} });

export function PrefsProvider({ children }: PropsWithChildren) {
  const [themePref, setPref] = useState<ThemePref>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((value) => {
        if (value === 'light' || value === 'dark') setPref(value);
      })
      .catch(() => {});
  }, []);

  const setThemePref = (pref: ThemePref) => {
    setPref(pref);
    AsyncStorage.setItem(KEY, pref).catch(() => {});
  };

  return <PrefsContext value={{ themePref, setThemePref }}>{children}</PrefsContext>;
}

export function usePrefs() {
  return use(PrefsContext);
}
