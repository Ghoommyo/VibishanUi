import { delay, requireAuth, toPublic } from './client';
import { getDb } from './db';
import { findUser } from './internal';
import { ratingSummary } from './users';
import type { ProviderStats } from '../types';

const WEEK = 7 * 24 * 60 * 60 * 1000;
const WEEKS_SHOWN = 8;

export async function getProviderStats(): Promise<ProviderStats> {
  await delay();
  const me = requireAuth();
  const db = await getDb();
  const mine = db.rooms.filter((r) => r.providerId === me);
  const closed = mine.filter((r) => r.status === 'closed');
  const ratings = mine.flatMap((r) => r.ratings);
  const { average, count } = ratingSummary(db, me);

  const now = Date.now();
  const weekly = Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const weeksAgo = WEEKS_SHOWN - 1 - i;
    const end = now - weeksAgo * WEEK;
    const start = end - WEEK;
    const date = new Date(start + 1);
    return {
      label: weeksAgo === 0 ? 'Now' : `${date.getDate()}/${date.getMonth() + 1}`,
      value: closed.filter((r) => r.closedAt !== null && r.closedAt > start && r.closedAt <= end).length,
    };
  });

  return {
    listeningDone: closed.filter((r) => r.kind === 'listen').length,
    moderationDone: closed.filter((r) => r.kind === 'moderate').length,
    activeSessions: mine.filter((r) => r.status === 'active').length,
    averageRating: average,
    ratingCount: count,
    ratingDistribution: [1, 2, 3, 4, 5].map((s) => ratings.filter((r) => r.stars === s).length),
    weekly,
    feedback: ratings
      .filter((r) => r.feedback)
      .sort((a, b) => b.at - a.at)
      .map((r) => ({ by: toPublic(findUser(db, r.byId)), stars: r.stars, text: r.feedback, at: r.at })),
  };
}
