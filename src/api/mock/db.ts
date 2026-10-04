import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSeed } from './seed';
import type { DbState } from '../types';

const KEY = 'vibishan.db.v1';

let cache: DbState | null = null;

export async function getDb(): Promise<DbState> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) {
    cache = JSON.parse(raw) as DbState;
  } else {
    cache = createSeed();
    await persist();
  }
  return cache;
}

async function persist() {
  if (cache) await AsyncStorage.setItem(KEY, JSON.stringify(cache));
}

/** Runs a mutation against the snapshot and saves it. */
export async function transact<T>(fn: (db: DbState) => T): Promise<T> {
  const db = await getDb();
  const result = fn(db);
  await persist();
  return result;
}

export async function resetDb() {
  cache = createSeed();
  await persist();
}
