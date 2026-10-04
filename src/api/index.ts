// The app talks to the backend only through these namespaces. By default they call the HTTP API;
// EXPO_PUBLIC_USE_MOCK=1 swaps in the in-app AsyncStorage backend. The annotations keep both in step.
import { USE_MOCK } from './config';
import * as httpAnalytics from './http/analytics';
import * as httpAuth from './http/auth';
import * as httpDev from './http/dev';
import * as httpNotifications from './http/notifications';
import * as httpRequests from './http/requests';
import * as httpRooms from './http/rooms';
import * as httpUsers from './http/users';
import * as mockAnalytics from './mock/analytics';
import * as mockAuth from './mock/auth';
import * as mockDb from './mock/db';
import * as mockNotifications from './mock/notifications';
import * as mockRequests from './mock/requests';
import * as mockRooms from './mock/rooms';
import * as mockUsers from './mock/users';

export const analyticsApi: typeof httpAnalytics = USE_MOCK ? mockAnalytics : httpAnalytics;
export const authApi: typeof httpAuth = USE_MOCK ? mockAuth : httpAuth;
export const notificationsApi: typeof httpNotifications = USE_MOCK ? mockNotifications : httpNotifications;
export const requestsApi: typeof httpRequests = USE_MOCK ? mockRequests : httpRequests;
export const roomsApi: typeof httpRooms = USE_MOCK ? mockRooms : httpRooms;
export const usersApi: typeof httpUsers = USE_MOCK ? mockUsers : httpUsers;
export const resetDb: typeof httpDev.resetDb = USE_MOCK ? mockDb.resetDb : httpDev.resetDb;

export { API_URL, USE_MOCK } from './config';
export { CLOSURE_LABEL } from './constants';
export { ApiError } from './errors';
export { onUnauthorized } from './http/client';
export { DEMO_ACCOUNTS, DEMO_PASSWORD } from './mock/seed';
export type * from './types';
