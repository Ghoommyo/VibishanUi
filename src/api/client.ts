import type { PublicUser, User } from './types';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Simulates network latency so loading states are exercised. */
export function delay(min = 300, max = 600) {
  return new Promise<void>((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

// Stands in for an auth token: a real backend would identify the caller from the request.
let currentUserId: string | null = null;

export function setCurrentUserId(id: string | null) {
  currentUserId = id;
}

export function requireAuth(): string {
  if (!currentUserId) throw new ApiError('unauthorized', 'Please log in again.');
  return currentUserId;
}

export function toPublic({ password: _password, ...user }: User): PublicUser {
  return user;
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
