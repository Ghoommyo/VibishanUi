import { ApiError, delay, requireAuth, toPublic } from './client';
import { getDb, transact } from './db';
import type { DbState, Profile, ProviderRole, PublicUser, UserSettings } from './types';

export type RatingSummary = { average: number | null; count: number };
export type ProviderSummary = PublicUser & { rating: RatingSummary };

export function ratingSummary(db: DbState, providerId: string): RatingSummary {
  const stars = db.rooms.filter((r) => r.providerId === providerId).flatMap((r) => r.ratings.map((x) => x.stars));
  if (stars.length === 0) return { average: null, count: 0 };
  return { average: stars.reduce((a, b) => a + b, 0) / stars.length, count: stars.length };
}

function matches(user: PublicUser, query: string) {
  const q = query.trim().toLowerCase();
  return !q || user.username.toLowerCase().includes(q) || user.profile.name.toLowerCase().includes(q);
}

export async function listProviders(role: ProviderRole, query = ''): Promise<ProviderSummary[]> {
  await delay(150, 300);
  const db = await getDb();
  return db.users
    .filter((u) => u.role === role && u.settings.available)
    .map((u) => ({ ...toPublic(u), rating: ratingSummary(db, u.id) }))
    .filter((u) => matches(u, query));
}

/** Other users (role "user") that can be added as participants. */
export async function searchUsers(query = ''): Promise<PublicUser[]> {
  await delay(150, 300);
  const me = requireAuth();
  const db = await getDb();
  return db.users
    .filter((u) => u.role === 'user' && u.id !== me)
    .map(toPublic)
    .filter((u) => matches(u, query));
}

export async function getUser(id: string): Promise<PublicUser> {
  const db = await getDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError('not_found', 'User not found.');
  return toPublic(user);
}

export async function getMe(): Promise<ProviderSummary> {
  const me = requireAuth();
  const db = await getDb();
  const user = db.users.find((u) => u.id === me);
  if (!user) throw new ApiError('not_found', 'User not found.');
  return { ...toPublic(user), rating: ratingSummary(db, me) };
}

export async function updateProfile(patch: Partial<Profile> & { email?: string }): Promise<PublicUser> {
  await delay();
  const me = requireAuth();
  return transact((db) => {
    const user = db.users.find((u) => u.id === me);
    if (!user) throw new ApiError('not_found', 'User not found.');
    const { email, ...profile } = patch;
    if (email !== undefined) {
      const normalized = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new ApiError('invalid_email', 'Enter a valid email.');
      if (db.users.some((u) => u.id !== me && u.email.toLowerCase() === normalized)) {
        throw new ApiError('email_taken', 'An account with that email already exists.');
      }
      user.email = normalized;
    }
    user.profile = { ...user.profile, ...profile };
    return toPublic(user);
  });
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<PublicUser> {
  await delay(100, 200);
  const me = requireAuth();
  return transact((db) => {
    const user = db.users.find((u) => u.id === me);
    if (!user) throw new ApiError('not_found', 'User not found.');
    user.settings = { ...user.settings, ...patch };
    return toPublic(user);
  });
}
