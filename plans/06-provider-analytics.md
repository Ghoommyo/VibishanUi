# Phase 6: Listener and moderator analytics dashboard

## Files
- `src/components/provider-analytics.tsx`, which reads `analytics.getProviderStats`:
  - Stat tiles: listening events done, moderation events done, average rating, total ratings.
  - A sessions-per-week `BarChart` covering the last 8 weeks.
  - A rating-distribution `BarChart` (1–5 stars).
  - A list of user feedback: stars, comment, who left it, and the date.
  - A link to Chatrooms.
- `src/components/charts/bar-chart.tsx` is built with `react-native-svg`. It takes a `{label, value}[]` series, sizes itself to the container width with `onLayout`, uses `useTheme` colours, and shows axis labels and value labels.

## Done when
Seeded listeners and moderators see non-empty charts. Finishing a new session and rating it updates the counts, the average rating and the feedback list.
