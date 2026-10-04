import { API_URL } from '../config';
import { ApiError } from '../errors';
import { getToken, saveToken } from './token';

const BASE = `${API_URL}/api/v1`;

type Query = Record<string, string | number | undefined>;

const unauthorizedListeners = new Set<() => void>();

/** Called when the server rejects the stored token, so the app can drop back to the login screens. */
export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

/** Encodes one path segment, e.g. path`/rooms/${id}`. */
export function path(strings: TemplateStringsArray, ...values: string[]) {
  return strings.reduce((out, s, i) => out + s + (i < values.length ? encodeURIComponent(values[i]) : ''), '');
}

export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  { body, query }: { body?: unknown; query?: Query } = {},
): Promise<T> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) params.append(k, String(v));
  const qs = params.toString();

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${url}${qs ? `?${qs}` : ''}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('network', "Can't reach the server. Check your connection.");
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    const error = (data as { error?: { code?: string; message?: string } } | undefined)?.error;
    if (res.status === 401 && (!error || error.code === 'unauthorized')) {
      await saveToken(null);
      unauthorizedListeners.forEach((listener) => listener());
    }
    if (error?.code && error.message) throw new ApiError(error.code, error.message);
    throw new ApiError('server', 'Something went wrong. Please try again.');
  }
  return data as T;
}
