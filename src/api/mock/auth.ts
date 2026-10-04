import AsyncStorage from '@react-native-async-storage/async-storage';

import { ApiError, delay, newId, setCurrentUserId, toPublic } from './client';
import { getDb, transact } from './db';
import type { PublicUser, Role, SignupInput } from '../types';

// The mock "token" is just the user id, kept across app restarts.
const SESSION_KEY = 'vibishan.session.userId';

async function startSession(user: PublicUser) {
  setCurrentUserId(user.id);
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return user;
}

const ROLE_LABEL: Record<Role, string> = { user: 'User', listener: 'Listener', moderator: 'Moderator' };

export async function login(username: string, password: string, role: Role): Promise<PublicUser> {
  await delay();
  const db = await getDb();
  const user = db.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new ApiError('invalid_credentials', 'Incorrect username or password.');
  }
  if (user.role !== role) {
    throw new ApiError('wrong_role', `This account is registered as a ${ROLE_LABEL[user.role]}.`);
  }
  return startSession(toPublic(user));
}

export async function signup(input: SignupInput): Promise<PublicUser> {
  await delay();
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const user = await transact((db) => {
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new ApiError('username_taken', 'That username is already taken.');
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw new ApiError('email_taken', 'An account with that email already exists.');
    }
    const created = {
      id: newId('u'),
      username,
      email,
      password: input.password,
      role: input.role,
      profile: { name: username, phone: '', bio: '', expertise: [] },
      settings: { notifyRequests: true, showMessagePreviews: true, available: true },
      createdAt: Date.now(),
    };
    db.users.push(created);
    return created;
  });
  return startSession(toPublic(user));
}

/** Re-establishes a stored session on app start. Returns null if there is none or the account no longer exists. */
export async function restoreSession(): Promise<PublicUser | null> {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  const db = await getDb();
  const user = db.users.find((u) => u.id === userId);
  setCurrentUserId(user?.id ?? null);
  return user ? toPublic(user) : null;
}

export async function logout() {
  setCurrentUserId(null);
  await AsyncStorage.removeItem(SESSION_KEY);
}
