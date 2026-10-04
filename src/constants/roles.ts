import type { Role } from '@/api';

export const ROLE_LABEL: Record<Role, string> = {
  user: 'User',
  listener: 'Listener',
  moderator: 'Moderator',
};

export const ROLE_OPTIONS = (['user', 'listener', 'moderator'] as const).map((value) => ({
  value,
  label: ROLE_LABEL[value],
}));

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
