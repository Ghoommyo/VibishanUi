import { ApiError, delay, newId, requireAuth } from './client';
import { transact } from './db';
import { displayName, findUser, listNames, notify } from './internal';
import type { DbState, ServiceRequest } from './types';

export type SentRequestsResult = { providerNames: string[]; participantNames: string[] };

function createRoomAndRequest(
  db: DbState,
  kind: ServiceRequest['kind'],
  requesterId: string,
  providerId: string,
  participantIds: string[],
): ServiceRequest {
  const now = Date.now();
  const request: ServiceRequest = {
    id: newId('req'),
    kind,
    requesterId,
    providerId,
    participantIds,
    approvals: Object.fromEntries([...participantIds, providerId].map((id) => [id, 'pending' as const])),
    status: 'pending',
    roomId: newId('room'),
    createdAt: now,
  };
  db.requests.push(request);
  // The chat row exists from the start, in a pending state that can't be entered.
  db.rooms.push({
    id: request.roomId,
    kind,
    requestId: request.id,
    requesterId,
    providerId,
    memberIds: [requesterId, ...participantIds, providerId],
    status: 'pending',
    mutedIds: [],
    closures: {},
    ratings: [],
    createdAt: now,
    closedAt: null,
  });
  return request;
}

/** Sends one listening request per selected listener. */
export async function createListenRequests(providerIds: string[]): Promise<SentRequestsResult> {
  await delay();
  const me = requireAuth();
  if (providerIds.length === 0) throw new ApiError('validation', 'Select at least one listener.');
  return transact((db) => {
    const requesterName = displayName(db, me);
    for (const providerId of providerIds) {
      if (findUser(db, providerId).role !== 'listener') {
        throw new ApiError('validation', `${displayName(db, providerId)} is not a listener.`);
      }
    }
    for (const providerId of providerIds) {
      const request = createRoomAndRequest(db, 'listen', me, providerId, []);
      notify(db, providerId, 'request_received', request.id, `${requesterName} requested a listening session.`);
      notify(db, me, 'request_sent', request.id, `You sent a listening request to ${displayName(db, providerId)}.`);
    }
    return { providerNames: providerIds.map((id) => displayName(db, id)), participantNames: [] };
  });
}

/** Sends a moderation request. Participants approve first; the moderator is asked only after all of them accept. */
export async function createModerateRequest(providerId: string, participantIds: string[]): Promise<SentRequestsResult> {
  await delay();
  const me = requireAuth();
  const participants = [...new Set(participantIds)].filter((id) => id !== me);
  if (participants.length === 0) throw new ApiError('validation', 'Add at least one participant.');
  return transact((db) => {
    if (findUser(db, providerId).role !== 'moderator') {
      throw new ApiError('validation', `${displayName(db, providerId)} is not a moderator.`);
    }
    for (const id of participants) {
      if (findUser(db, id).role !== 'user') {
        throw new ApiError('validation', `${displayName(db, id)} can't be added as a participant.`);
      }
    }
    const request = createRoomAndRequest(db, 'moderate', me, providerId, participants);
    const requesterName = displayName(db, me);
    const moderatorName = displayName(db, providerId);
    for (const id of participants) {
      notify(db, id, 'request_received', request.id, `${requesterName} invited you to a session moderated by ${moderatorName}.`);
    }
    const participantNames = participants.map((id) => displayName(db, id));
    notify(
      db,
      me,
      'request_sent',
      request.id,
      `You sent a moderation request to ${moderatorName} with ${listNames(participantNames)}.`,
    );
    return { providerNames: [moderatorName], participantNames };
  });
}

export function participantsAllAccepted(request: ServiceRequest) {
  return request.participantIds.every((id) => request.approvals[id] === 'accepted');
}

export async function respond(requestId: string, accept: boolean): Promise<ServiceRequest> {
  await delay();
  const me = requireAuth();
  return transact((db) => {
    const request = db.requests.find((r) => r.id === requestId);
    if (!request) throw new ApiError('not_found', 'Request not found.');
    if (request.status !== 'pending') throw new ApiError('closed', 'This request has already been resolved.');
    if (request.approvals[me] !== 'pending') throw new ApiError('forbidden', 'You have already responded.');
    const isProvider = me === request.providerId;
    if (isProvider && request.kind === 'moderate' && !participantsAllAccepted(request)) {
      throw new ApiError('forbidden', 'Waiting for all participants to accept first.');
    }

    const room = db.rooms.find((r) => r.id === request.roomId);
    const myName = displayName(db, me);
    const others = [request.requesterId, ...request.participantIds].filter((id) => id !== me);
    request.approvals[me] = accept ? 'accepted' : 'rejected';

    if (!accept) {
      request.status = 'rejected';
      if (room) room.status = 'rejected';
      for (const id of others) notify(db, id, 'request_update', request.id, `${myName} declined the request.`);
      return request;
    }

    if (isProvider) {
      request.status = 'accepted';
      if (room) room.status = 'active';
      for (const id of others) {
        notify(db, id, 'request_update', request.id, `${myName} accepted. The chatroom is now open.`);
      }
      return request;
    }

    // A participant accepted a moderation request.
    notify(db, request.requesterId, 'request_update', request.id, `${myName} accepted your invitation.`);
    if (participantsAllAccepted(request)) {
      notify(
        db,
        request.providerId,
        'request_received',
        request.id,
        `${displayName(db, request.requesterId)} requested a moderated session with ${listNames(
          request.participantIds.map((id) => displayName(db, id)),
        )}.`,
      );
    }
    return request;
  });
}
