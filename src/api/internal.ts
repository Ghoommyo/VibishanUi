// Helpers shared by the API modules. Not imported by UI code.
import { ApiError, newId } from './client';
import type { DbState, NotificationKind, User } from './types';

export function findUser(db: DbState, id: string): User {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError('not_found', 'User not found.');
  return user;
}

export function displayName(db: DbState, id: string) {
  const user = db.users.find((u) => u.id === id);
  return user ? user.profile.name || user.username : 'Unknown user';
}

export function listNames(names: string[]) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function notify(db: DbState, userId: string, kind: NotificationKind, requestId: string, text: string) {
  const user = db.users.find((u) => u.id === userId);
  db.notifications.push({
    id: newId('ntf'),
    userId,
    kind,
    requestId,
    text,
    // Users who turned off request updates still get them in the list, just without the unread badge.
    read: kind === 'request_update' && user?.settings.notifyRequests === false,
    createdAt: Date.now(),
  });
}
