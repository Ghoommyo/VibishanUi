import type { Profile, ProviderRole, ProviderSummary, PublicUser, UserSettings } from '../types';
import { path, request } from './client';

export async function listProviders(role: ProviderRole, query = ''): Promise<ProviderSummary[]> {
  return request('GET', '/providers', { query: { role, q: query || undefined } });
}

/** Other users (role "user") that can be added as participants. */
export async function searchUsers(query = ''): Promise<PublicUser[]> {
  return request('GET', '/users/search', { query: { q: query || undefined } });
}

export async function getUser(id: string): Promise<PublicUser> {
  return request('GET', path`/users/${id}`);
}

export async function getMe(): Promise<ProviderSummary> {
  return request('GET', '/users/me');
}

export async function updateProfile(patch: Partial<Profile> & { email?: string }): Promise<PublicUser> {
  return request('PATCH', '/users/me/profile', { body: patch });
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<PublicUser> {
  return request('PATCH', '/users/me/settings', { body: patch });
}
