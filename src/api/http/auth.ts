import { ApiError } from '../errors';
import type { PublicUser, Role, SignupInput } from '../types';
import { request } from './client';
import { loadToken, saveToken } from './token';

type AuthResponse = { token: string; user: PublicUser };

async function startSession(res: AuthResponse) {
  await saveToken(res.token);
  return res.user;
}

export async function login(username: string, password: string, role: Role): Promise<PublicUser> {
  return startSession(await request<AuthResponse>('POST', '/auth/login', { body: { username, password, role } }));
}

export async function signup(input: SignupInput): Promise<PublicUser> {
  return startSession(await request<AuthResponse>('POST', '/auth/signup', { body: input }));
}

/** Re-establishes a stored session on app start. Returns null if there is no token or it is no longer valid. */
export async function restoreSession(): Promise<PublicUser | null> {
  if (!(await loadToken())) return null;
  try {
    return await request<PublicUser>('GET', '/auth/me');
  } catch (e) {
    // A rejected token has already been cleared by the client; anything else (e.g. offline) is rethrown.
    if (e instanceof ApiError && e.code === 'unauthorized') return null;
    throw e;
  }
}

export async function logout() {
  await request('POST', '/auth/logout').catch(() => {});
  await saveToken(null);
}
