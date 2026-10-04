import { Platform } from 'react-native';

/** Set EXPO_PUBLIC_USE_MOCK=1 to run against the in-app AsyncStorage backend instead of the server. */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';

// The Android emulator reaches the host machine through 10.0.2.2. Physical devices need the host's LAN IP.
const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
