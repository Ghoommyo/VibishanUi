import { request } from './client';

/** Restores the server's seed data. Only available when the server has dev endpoints enabled. */
export async function resetDb() {
  await request('POST', '/dev/reset');
}
