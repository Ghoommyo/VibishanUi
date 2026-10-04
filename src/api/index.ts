// The app talks to the backend only through these namespaces. Swap the implementations for real HTTP calls later.
export * as analyticsApi from './analytics';
export * as authApi from './auth';
export { ApiError } from './client';
export { resetDb } from './db';
export * as notificationsApi from './notifications';
export * as requestsApi from './requests';
export * as roomsApi from './rooms';
export { DEMO_ACCOUNTS, DEMO_PASSWORD } from './seed';
export type * from './types';
export * as usersApi from './users';
