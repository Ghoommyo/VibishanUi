# Phase 1: Dummy API layer

## Goal
Build a typed, persisted in-app backend that every later phase uses. It has no UI.

## Steps
1. `npx expo install @react-native-async-storage/async-storage react-native-svg`
2. Create `src/api/` with the files below.

## Files
- `types.ts`:
  - `Role = 'user' | 'listener' | 'moderator'`
  - `User`: id, username, email, password, role, profile `{name, phone, bio, expertise[]}`, `available`, createdAt
  - `ServiceRequest`: id, kind `'listen' | 'moderate'`, requesterId, providerId, participantIds, `approvals: Record<userId, 'pending' | 'accepted' | 'rejected'>`, status, roomId, createdAt
  - `Room`: id, kind, requestId, memberIds, providerId, status `'pending' | 'active' | 'closed' | 'rejected'`, mutedIds, `closures: Record<userId, {text, at}>`, ratings `[{byId, stars, feedback}]`
  - `Message`: id, roomId, senderId, text, starredBy[], createdAt
  - `Notification`: id, userId, kind, requestId, read, createdAt
- `db.ts` loads and saves one JSON snapshot under AsyncStorage key `vibishan.db.v1`, seeds it on first run, and exports `resetDb()`.
- `seed.ts` creates these demo accounts, all with password `password123`:
  - Users: alice, bob, carol
  - Listeners: lisa, leo
  - Moderators: maya, max

  It also adds some past closed rooms with stars, closures, ratings and feedback, spread over the last 8 weeks so the analytics charts have data.
- `client.ts` provides `delay()` (a random 300–600ms) and `ApiError` (code plus message).
- `auth.ts`:
  - `login(username, password, role)` fails when the role doesn't match the account.
  - `signup(...)` enforces a unique username and email.
  - `logout()`.
- `users.ts`: `listProviders(role, query)` returns only available providers, each with average rating and rating count. Also `searchUsers(query)` (role user only, excluding self), `getUser`, `updateProfile`, `updateSettings`.
- `requests.ts`: `createListenRequests(providerIds[])`, `createModerateRequest(providerId, participantIds)`, `respond(requestId, accept)`.
- `rooms.ts`: `listMyRooms`, `getRoom`, `listMessages`, `sendMessage`, `toggleStar`, `submitClosure`, `setMuted`, `rate`, `getSummary`.
- `notifications.ts`: `list`, `markRead`, `unreadCount`.
- `analytics.ts`: `getProviderStats(userId)` returns listen and moderate counts, average rating, rating distribution, sessions per week for the last 8 weeks, and recent feedback.

## Business rules (enforced here, not in the UI)
- **Listen request**: one request and one room per selected listener. The room starts as `pending`. The listener is notified. Accept makes the room `active`; reject makes it `rejected`. The requester is notified of the result.
- **Moderate request**: needs at least one participant. Participants are notified first. The moderator is notified **only once every participant has accepted**. The room becomes `active` after the moderator accepts. Any rejection makes it `rejected`.
- **Sending messages**: allowed only when the room is `active`, the sender hasn't submitted a closure, and the sender isn't muted.
- **Muting**: only the room's moderator can call `setMuted`.
- **Closure**:
  - Users and participants submit a Conclusion; listeners submit an Observation.
  - A moderator's Verdict closes the room for everyone.
  - A listen room closes once every member has submitted.
- **Rating**: each non-provider member can rate the provider once (1–5 stars plus optional feedback), and only after the room is closed.
- **Summary**: starred messages in order, then participant conclusions, the listener's observation, and the moderator's verdict.

## Done when
`tsc` and lint pass, and calling each function by hand from a scratch screen or the console behaves as the rules above describe.
