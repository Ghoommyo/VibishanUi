import type { Message, MessageWithSender, Room, RoomDetail, RoomListItem, RoomSummary } from '../types';
import { path, request } from './client';

export async function listMyRooms(): Promise<RoomListItem[]> {
  return request('GET', '/rooms');
}

export async function getRoom(roomId: string): Promise<RoomDetail> {
  return request('GET', path`/rooms/${roomId}`);
}

export async function listMessages(roomId: string): Promise<MessageWithSender[]> {
  return request('GET', path`/rooms/${roomId}/messages`);
}

export async function sendMessage(roomId: string, text: string): Promise<Message> {
  return request('POST', path`/rooms/${roomId}/messages`, { body: { text } });
}

export async function toggleStar(messageId: string): Promise<Message> {
  return request('POST', path`/messages/${messageId}/star`);
}

/**
 * Submits the current user's closing note. Afterwards they can only read.
 * A moderator's verdict closes the room for everyone; a listening room closes once every member has submitted.
 */
export async function submitClosure(roomId: string, text: string): Promise<Room> {
  return request('POST', path`/rooms/${roomId}/closure`, { body: { text } });
}

export async function setMuted(roomId: string, userId: string, muted: boolean): Promise<Room> {
  return request('PUT', path`/rooms/${roomId}/members/${userId}/mute`, { body: { muted } });
}

export async function rate(roomId: string, stars: number, feedback: string): Promise<Room> {
  return request('POST', path`/rooms/${roomId}/ratings`, { body: { stars, feedback } });
}

export async function getSummary(roomId: string): Promise<RoomSummary> {
  return request('GET', path`/rooms/${roomId}/summary`);
}
