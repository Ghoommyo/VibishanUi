# Phase 8: Integrate with the FastAPI backend

## Goal
Point the app at the real backend described in [`docs/backend-api-spec.md`](../docs/backend-api-spec.md) (FastAPI + Postgres, routes under `/api/v1`) without changing any screen. The in-app mock stays available behind a flag so the app can still run offline or without a server.

## Decisions
- **Base URL**: `EXPO_PUBLIC_API_URL`, defaulting to `http://127.0.0.1:8000`. On Android it defaults to `http://10.0.2.2:8000`, the emulator's alias for the host. On a physical device, set it to the host's LAN IP.
- **Mock switch**: `EXPO_PUBLIC_USE_MOCK=1` runs the old AsyncStorage backend. Leave it unset to use the server.
- **Token storage**: native uses `expo-secure-store` (Keychain/Keystore, bundled in Expo Go). SecureStore has no web implementation, so web uses `localStorage`.
- **Function signatures stay the same**, so screens and `useApi` polling need no changes. The one exception is `authApi.restoreSession()`, which no longer takes a user id (see below).

## Structure
```
src/api/
  index.ts        picks http or mock per namespace; re-exports types, ApiError, constants, onUnauthorized
  types.ts        every shared type, including response shapes that used to live in the mock modules
  errors.ts       ApiError(code, message)
  constants.ts    CLOSURE_LABEL
  config.ts       API_URL, USE_MOCK
  http/           client.ts (fetch wrapper), token.ts, and one module per namespace, plus dev.ts (resetDb)
  mock/           the previous implementation, moved unchanged apart from imports and session persistence
```
Each namespace in `index.ts` is declared as `typeof http<Module>`, so `tsc` fails if the mock's shape drifts from the http one:
```ts
export const roomsApi: typeof httpRooms = USE_MOCK ? mockRooms : httpRooms;
```
UI code only imports from `@/api`. Sub-path imports such as `@/api/rooms` are gone.

## Endpoint mapping
| Function | Endpoint |
|---|---|
| `authApi.login` / `signup` | `POST /auth/login`, `POST /auth/signup` (stores `token`, returns `user`) |
| `authApi.restoreSession` | `GET /auth/me` |
| `authApi.logout` | `POST /auth/logout`, then drop the token |
| `usersApi.getMe` / `getUser(id)` | `GET /users/me`, `GET /users/{id}` |
| `usersApi.updateProfile` / `updateSettings` | `PATCH /users/me/profile`, `PATCH /users/me/settings` |
| `usersApi.listProviders(role, q)` | `GET /providers?role=&q=` |
| `usersApi.searchUsers(q)` | `GET /users/search?q=` |
| `requestsApi.createListenRequests` | `POST /requests/listen` |
| `requestsApi.createModerateRequest` | `POST /requests/moderate` |
| `requestsApi.respond` | `POST /requests/{id}/respond` |
| `roomsApi.listMyRooms` / `getRoom` / `listMessages` | `GET /rooms`, `GET /rooms/{id}`, `GET /rooms/{id}/messages` |
| `roomsApi.sendMessage` / `toggleStar` | `POST /rooms/{id}/messages`, `POST /messages/{id}/star` |
| `roomsApi.submitClosure` / `setMuted` / `rate` | `POST /rooms/{id}/closure`, `PUT /rooms/{id}/members/{uid}/mute`, `POST /rooms/{id}/ratings` |
| `roomsApi.getSummary` | `GET /rooms/{id}/summary` |
| `notificationsApi.list` / `unreadCount` / `markAllRead` | `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/read-all` |
| `analyticsApi.getProviderStats` | `GET /analytics/provider?tzOffset=<getTimezoneOffset()>` |
| `resetDb` | `POST /dev/reset` (needs `ENABLE_DEV_ENDPOINTS=true` on the server) |

## Auth and session flow
- `login`/`signup` persist their own credential. For http that is the JWT; for the mock it is the user id under `vibishan.session.userId`. `SessionProvider` no longer touches storage.
- On app start, `restoreSession()` loads the token and calls `/auth/me`. If the token is rejected it returns `null`, which leads to the logged-out screens. If the server is unreachable it throws, and the provider also treats that as logged out.
- `onUnauthorized(listener)`: when any request gets a `401 unauthorized` (expired token, or an account wiped by a reset), the client clears the token and notifies listeners. `SessionProvider` sets the user to `null`, and the `Stack.Protected` guards send the user to welcome. `invalid_credentials` on login does not trigger this.

## Error handling
- `{ error: { code, message } }` becomes `ApiError(code, message)`. Messages come from the server and are shown as-is, so existing checks like `e.code === 'username_taken'` keep working.
- A non-envelope error body becomes `ApiError('server', 'Something went wrong. Please try again.')`.
- A network failure becomes `ApiError('network', "Can't reach the server. Check your connection.")`.
- Settings → Reset now shows the error in the dialog if the reset fails, for example when dev endpoints are disabled.

## Running
1. Start the server. Its `CORS_ORIGINS` must include `http://localhost:8081` for Expo web.
2. Optionally copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL`.
3. `npm run web`, or `npm run ios` / `npm run android`. Restart Metro after changing env vars, because they are inlined at bundle time.

## Verification
- `npx tsc --noEmit`, `npm run lint`, and `npx expo export --platform ios --platform android --platform web` all pass.
- The spec's §11 acceptance checklist was run through the compiled `src/api/http/*` modules against the live server, with SecureStore and `react-native` stubbed in Node. All 39 checks passed: login/wrong role, providers and ratings, listen request → accept → chat → star → closures → rating → analytics, moderation with participant-first approval, mute and verdict, rejection with `notifyRequests` off, profile validation, signup conflict, bad token → `onUnauthorized`, logout, and reset.
- Still to do by hand: walk the same flows in the UI on web and on a device, including a reload to confirm the session is restored. Check that `EXPO_PUBLIC_USE_MOCK=1 npm run web` still runs the mock end to end.

## Known limits
- Release Android builds block cleartext `http://`. Use an `https://` API URL (for example the Vercel deployment) for production builds.
- `listMessages` still re-fetches the whole history every 2 seconds. The server supports `?after=` for incremental polling, which could be wired in later.
