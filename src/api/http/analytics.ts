import type { ProviderStats } from '../types';
import { request } from './client';

export async function getProviderStats(): Promise<ProviderStats> {
  // The server renders week labels in the device's timezone.
  return request('GET', '/analytics/provider', { query: { tzOffset: new Date().getTimezoneOffset() } });
}
