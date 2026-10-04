import { ApiError, delay, newId, requireAuth, toPublic } from './client';
import { getDb, transact } from './db';
import { findUser } from './internal';
import type { DbState, Message, PublicUser, Room } from './types';

/** How the current user takes part in a room. Decides the closing-note label and permissions. */
export type RoomRole = 'member' | 'listener' | 'moderator';
export type ClosureLabel = 'Conclusion' | 'Observation' | 'Verdict';

export const CLOSURE_LABEL: Record<RoomRole, ClosureLabel> = {
  member: 'Conclusion',
  listener: 'Observation',
  moderator: 'Verdict',
};

export type RoomListItem = {
  room: Room;
  provider: PublicUser;
  others: PublicUser[];
  lastMessage: Message | null;
  lastActivity: number;
};

export type RoomDetail = {
  room: Room;
  members: PublicUser[];
  myRole: RoomRole;
  canSend: boolean;
  /** Why the composer is disabled, when it is. */
  sendBlockedReason: string | null;
  hasSubmitted: boolean;
  needsRating: boolean;
};

export type MessageWithSender = Message & { sender: PublicUser };

export type RoomSummary = {
  room: Room;
  provider: PublicUser;
  starred: MessageWithSender[];
  comments: { user: PublicUser; text: string; at: number }[];
  observation: { user: PublicUser; text: string } | null;
  verdict: { user: PublicUser; text: string } | null;
};

function roomRoleOf(room: Room, userId: string): RoomRole {
  if (userId !== room.providerId) return 'member';
  return room.kind === 'listen' ? 'listener' : 'moderator';
}

function getMemberRoom(db: DbState, roomId: string, me: string): Room {
  const room = db.rooms.find((r) => r.id === roomId);
  if (!room || !room.memberIds.includes(me)) throw new ApiError('not_found', 'Chatroom not found.');
  return room;
}

function sendBlockedReason(room: Room, me: string): string | null {
  if (room.status === 'pending') return 'Waiting for everyone to approve.';
  if (room.status === 'rejected') return 'This request was declined.';
  if (room.status === 'closed') return 'This chat is closed.';
  if (room.closures[me]) return 'You have submitted and left this chat.';
  if (room.mutedIds.includes(me)) return 'You have been muted by the moderator.';
  return null;
}

export async function listMyRooms(): Promise<RoomListItem[]> {
  await delay(150, 300);
  const me = requireAuth();
  const db = await getDb();
  return db.rooms
    .filter((r) => r.memberIds.includes(me))
    .map((room) => {
      const messages = db.messages.filter((m) => m.roomId === room.id);
      const lastMessage = messages.length ? messages[messages.length - 1] : null;
      return {
        room,
        provider: toPublic(findUser(db, room.providerId)),
        others: room.memberIds.filter((id) => id !== me).map((id) => toPublic(findUser(db, id))),
        lastMessage,
        lastActivity: Math.max(room.createdAt, lastMessage?.createdAt ?? 0, room.closedAt ?? 0),
      };
    })
    .sort((a, b) => b.lastActivity - a.lastActivity);
}

export async function getRoom(roomId: string): Promise<RoomDetail> {
  const me = requireAuth();
  const db = await getDb();
  const room = getMemberRoom(db, roomId, me);
  const reason = sendBlockedReason(room, me);
  const myRole = roomRoleOf(room, me);
  return {
    room,
    members: room.memberIds.map((id) => toPublic(findUser(db, id))),
    myRole,
    canSend: reason === null,
    sendBlockedReason: reason,
    hasSubmitted: Boolean(room.closures[me]),
    needsRating: room.status === 'closed' && myRole === 'member' && !room.ratings.some((r) => r.byId === me),
  };
}

export async function listMessages(roomId: string): Promise<MessageWithSender[]> {
  const me = requireAuth();
  const db = await getDb();
  getMemberRoom(db, roomId, me);
  return db.messages
    .filter((m) => m.roomId === roomId)
    .map((m) => ({ ...m, sender: toPublic(findUser(db, m.senderId)) }));
}

export async function sendMessage(roomId: string, text: string): Promise<Message> {
  await delay(100, 250);
  const me = requireAuth();
  const body = text.trim();
  if (!body) throw new ApiError('validation', 'Message is empty.');
  return transact((db) => {
    const room = getMemberRoom(db, roomId, me);
    const reason = sendBlockedReason(room, me);
    if (reason) throw new ApiError('forbidden', reason);
    const message: Message = { id: newId('msg'), roomId, senderId: me, text: body, starredBy: [], createdAt: Date.now() };
    db.messages.push(message);
    return message;
  });
}

export async function toggleStar(messageId: string): Promise<Message> {
  const me = requireAuth();
  return transact((db) => {
    const message = db.messages.find((m) => m.id === messageId);
    if (!message) throw new ApiError('not_found', 'Message not found.');
    getMemberRoom(db, message.roomId, me);
    message.starredBy = message.starredBy.includes(me)
      ? message.starredBy.filter((id) => id !== me)
      : [...message.starredBy, me];
    return message;
  });
}

/**
 * Submits the current user's closing note. Afterwards they can only read.
 * A moderator's verdict closes the room for everyone; a listening room closes once every member has submitted.
 */
export async function submitClosure(roomId: string, text: string): Promise<Room> {
  await delay();
  const me = requireAuth();
  return transact((db) => {
    const room = getMemberRoom(db, roomId, me);
    if (room.status !== 'active') throw new ApiError('forbidden', 'This chat is not open.');
    if (room.closures[me]) throw new ApiError('forbidden', 'You have already submitted.');
    const now = Date.now();
    room.closures[me] = { userId: me, text: text.trim(), at: now };
    const closesRoom =
      roomRoleOf(room, me) === 'moderator' ||
      (room.kind === 'listen' && room.memberIds.every((id) => room.closures[id]));
    if (closesRoom) {
      room.status = 'closed';
      room.closedAt = now;
    }
    return room;
  });
}

export async function setMuted(roomId: string, userId: string, muted: boolean): Promise<Room> {
  await delay(100, 250);
  const me = requireAuth();
  return transact((db) => {
    const room = getMemberRoom(db, roomId, me);
    if (roomRoleOf(room, me) !== 'moderator') throw new ApiError('forbidden', 'Only the moderator can mute.');
    if (userId === me || !room.memberIds.includes(userId)) throw new ApiError('validation', 'Cannot mute this member.');
    room.mutedIds = muted ? [...new Set([...room.mutedIds, userId])] : room.mutedIds.filter((id) => id !== userId);
    return room;
  });
}

export async function rate(roomId: string, stars: number, feedback: string): Promise<Room> {
  await delay();
  const me = requireAuth();
  if (stars < 1 || stars > 5) throw new ApiError('validation', 'Choose between 1 and 5 stars.');
  return transact((db) => {
    const room = getMemberRoom(db, roomId, me);
    if (room.status !== 'closed') throw new ApiError('forbidden', 'You can rate once the chat is closed.');
    if (roomRoleOf(room, me) !== 'member') throw new ApiError('forbidden', 'Providers do not rate themselves.');
    if (room.ratings.some((r) => r.byId === me)) throw new ApiError('forbidden', 'You have already rated.');
    room.ratings.push({ byId: me, stars, feedback: feedback.trim(), at: Date.now() });
    return room;
  });
}

export async function getSummary(roomId: string): Promise<RoomSummary> {
  await delay(150, 300);
  const me = requireAuth();
  const db = await getDb();
  const room = getMemberRoom(db, roomId, me);
  const user = (id: string) => toPublic(findUser(db, id));
  const providerClosure = room.closures[room.providerId];
  const providerNote = providerClosure ? { user: user(room.providerId), text: providerClosure.text } : null;
  return {
    room,
    provider: user(room.providerId),
    starred: db.messages
      .filter((m) => m.roomId === roomId && m.starredBy.length > 0)
      .map((m) => ({ ...m, sender: user(m.senderId) })),
    comments: Object.values(room.closures)
      .filter((c) => c.userId !== room.providerId)
      .sort((a, b) => a.at - b.at)
      .map((c) => ({ user: user(c.userId), text: c.text, at: c.at })),
    observation: room.kind === 'listen' ? providerNote : null,
    verdict: room.kind === 'moderate' ? providerNote : null,
  };
}
