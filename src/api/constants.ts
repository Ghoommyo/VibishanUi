import type { ClosureLabel, RoomRole } from './types';

export const CLOSURE_LABEL: Record<RoomRole, ClosureLabel> = {
  member: 'Conclusion',
  listener: 'Observation',
  moderator: 'Verdict',
};
