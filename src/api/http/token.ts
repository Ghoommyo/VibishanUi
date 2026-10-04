import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore has no web implementation, so web keeps the token in localStorage.
const KEY = 'vibishan.token';

let token: string | null = null;

export function getToken() {
  return token;
}

export async function loadToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      token = typeof window === 'undefined' ? null : window.localStorage.getItem(KEY);
    } else {
      token = await SecureStore.getItemAsync(KEY);
    }
  } catch {
    token = null;
  }
  return token;
}

export async function saveToken(next: string | null) {
  token = next;
  try {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      if (next) window.localStorage.setItem(KEY, next);
      else window.localStorage.removeItem(KEY);
    } else if (next) {
      await SecureStore.setItemAsync(KEY, next);
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  } catch {
    // The in-memory token still works for this run.
  }
}
