import type { SentRequestsResult, ServiceRequest } from '../types';
import { path, request } from './client';

/** Sends one listening request per selected listener. */
export async function createListenRequests(providerIds: string[]): Promise<SentRequestsResult> {
  return request('POST', '/requests/listen', { body: { providerIds } });
}

/** Sends a moderation request. Participants approve first; the moderator is asked only after all of them accept. */
export async function createModerateRequest(providerId: string, participantIds: string[]): Promise<SentRequestsResult> {
  return request('POST', '/requests/moderate', { body: { providerId, participantIds } });
}

export async function respond(requestId: string, accept: boolean): Promise<ServiceRequest> {
  return request('POST', path`/requests/${requestId}/respond`, { body: { accept } });
}
