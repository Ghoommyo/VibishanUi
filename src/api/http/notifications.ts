import type { NotificationItem } from '../types';
import { request } from './client';

export async function list(): Promise<NotificationItem[]> {
  return request('GET', '/notifications');
}

export async function unreadCount(): Promise<number> {
  const { count } = await request<{ count: number }>('GET', '/notifications/unread-count');
  return count;
}

export async function markAllRead() {
  await request('POST', '/notifications/read-all');
}
