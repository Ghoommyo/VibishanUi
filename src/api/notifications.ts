import { delay, requireAuth, toPublic } from './client';
import { getDb, transact } from './db';
import { findUser } from './internal';
import type { AppNotification, PublicUser, ServiceRequest } from './types';

export type NotificationItem = AppNotification & {
  request: ServiceRequest;
  requester: PublicUser;
  provider: PublicUser;
  participants: PublicUser[];
  /** True when the current user still has to accept or reject. */
  actionable: boolean;
};

export async function list(): Promise<NotificationItem[]> {
  await delay(150, 300);
  const me = requireAuth();
  const db = await getDb();
  return db.notifications
    .filter((n) => n.userId === me)
    .sort((a, b) => b.createdAt - a.createdAt)
    .flatMap((n) => {
      const request = db.requests.find((r) => r.id === n.requestId);
      if (!request) return [];
      return [
        {
          ...n,
          request,
          requester: toPublic(findUser(db, request.requesterId)),
          provider: toPublic(findUser(db, request.providerId)),
          participants: request.participantIds.map((id) => toPublic(findUser(db, id))),
          actionable:
            n.kind === 'request_received' && request.status === 'pending' && request.approvals[me] === 'pending',
        },
      ];
    });
}

export async function unreadCount(): Promise<number> {
  const me = requireAuth();
  const db = await getDb();
  return db.notifications.filter((n) => n.userId === me && !n.read).length;
}

export async function markAllRead() {
  const me = requireAuth();
  await transact((db) => {
    for (const n of db.notifications) if (n.userId === me) n.read = true;
  });
}
