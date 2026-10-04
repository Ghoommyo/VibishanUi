# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The rules in AGENTS.md (read the versioned Expo docs before touching any Expo/RN API, use `npx expo install`, never hand-edit `ios/`/`android/`) apply here. This project is on **Expo SDK 57** (React Native 0.86, React 19.2), so the docs to check are `https://docs.expo.dev/versions/v57.0.0/`.

## Commands

The package manager is npm (`package-lock.json`, no `bun.lock`).

```bash
npm start                # expo start (also: npm run ios | android | web)
npm run lint             # expo lint
npx tsc --noEmit         # typecheck
npx expo-doctor          # dependency/config checks
```

There is no test runner. To check a change, start the API server, run the app on web (`npm run web`) and walk the flows with the demo accounts below. Running `npx expo export --platform ios --platform android` is a quick way to confirm that native bundling still works.

Don't start Metro with `CI=1` while you're editing: in CI mode it doesn't watch files, so the browser keeps serving a stale bundle.

## What the app is

Users request either a 1:1 session with a **Listener** or a group session run by a **Moderator** (with at least one other user as a participant). Every request goes through approval, then a chatroom, closing notes (Conclusion / Observation / Verdict), ratings, and a summary. There are three account roles: `user`, `listener` and `moderator`. The per-phase design notes are in `plans/`.

## Architecture

### API layer: `src/api/`
UI code never changes data directly. It calls the namespaces exported from `src/api/index.ts` (`authApi`, `usersApi`, `requestsApi`, `roomsApi`, `notificationsApi`, `analyticsApi`, `resetDb`) and imports types only from `@/api`. There are two implementations, chosen in `index.ts`. Each namespace is typed as `typeof http<Module>`, so the two have to stay in step.
- **`http/`** (the default) is a FastAPI + Postgres backend that follows `docs/backend-api-spec.md`, under `${EXPO_PUBLIC_API_URL}/api/v1`. The default URL is `http://127.0.0.1:8000`, or `10.0.2.2` on Android.
  - `client.ts` `request()` turns `{error:{code,message}}` into `ApiError`. On a 401 `unauthorized` it clears the token and fires `onUnauthorized`, which `SessionProvider` uses to log out.
  - The JWT lives in `expo-secure-store` on native and `localStorage` on web (`http/token.ts`).
  - The server's `CORS_ORIGINS` must include `http://localhost:8081`.
- **`mock/`** is used when `EXPO_PUBLIC_USE_MOCK=1`. It is the original in-app backend. `db.ts` keeps one JSON snapshot in AsyncStorage (`vibishan.db.v1`), seeded from `seed.ts`, and mutations go through `transact()`. `client.ts` holds the current user id in place of a token.
- `authApi.login`/`signup`/`restoreSession()`/`logout` persist the credential themselves (the token or the mock user id), so `SessionProvider` doesn't touch storage.
- The integration notes are in `plans/08-api-integration.md`. See `.env.example` for the env vars.
- On the server, the business rules live in its services layer. In mock mode they're in `mock/requests.ts` and `mock/rooms.ts`:
  - Moderation requests need every participant to accept before the moderator is notified.
  - Rooms move through `pending → active → closed`, or to `rejected`.
  - Muted members, and members who have already submitted a closure, can't send messages.
  - A moderator's verdict closes the room for everyone. A listening room closes once every member has submitted.
- Demo accounts all use password `password123`: alice, bob, carol (users), lisa, leo (listeners), maya, max (moderators). The login screen has chips that fill these in.

### Routing: `src/app/`
- The root `_layout.tsx` wraps the app in `PrefsProvider` (theme override), then `SessionProvider`, then the navigation `ThemeProvider`. It uses `Stack.Protected` guards: `welcome`/`login`/`signup` when logged out, and `(app)` when logged in. In SDK 57 a blocked route falls back to `index.tsx`, which redirects (there's no `redirectTo` until SDK 58).
- `(app)/_layout.tsx` is a Stack holding the `(drawer)` group (home, chats, profile, settings), plus `notifications`, `chat/[id]/index` and `chat/[id]/summary`.
- `home.tsx` switches on role: `RequestServiceForm` for users, `ProviderAnalytics` for listeners and moderators.

### Data loading
`useApi(fetcher, key, { pollMs })` in `src/hooks/use-api.ts` refetches on screen focus and can poll. Polling is how changes made by "other users" show up (chat 2–3s, notification bell 3s). Pass a string `key` that names the fetched resource, e.g. ``room:${id}``.

### React Compiler gotcha
`reactCompiler` is enabled. The compiler hoists property reads it finds inside event handlers into render as memo dependencies. So `onPress={() => go(selected!.room.id)}` crashes while `selected` is null. Read the value during render with optional chaining (`const id = selected?.room.id`) and guard inside the handler instead. Don't add manual `useMemo`/`useCallback` without a reason.

### UI conventions
- Build with `ThemedText`/`ThemedView`/`useTheme()` and the tokens in `src/constants/theme.ts`. Any new colour goes in **both** the `light` and `dark` palettes. The `chart` token was validated for each surface separately.
- Shared primitives live in `src/components/ui/`:
  - Layout and controls: `Screen`, `Button`, `TextField`, `SegmentedControl`, `RadioGroup`, `Section`/`Row`
  - Overlays and pickers: `Dialog` (an RN `Modal`, which works on web), `SearchableSelect`
  - Display: `Avatar`, `StarRating`, `StatusPill`, `Icon`
- `Icon` maps names to SF Symbols on iOS and Material Symbols on Android and web, through `expo-symbols`. Add new icons to its map.
- `src/hooks/use-color-scheme.web.ts` returns `'light'` until hydration, because web output is static (`web.output: "static"`).
- Path aliases: `@/*` maps to `src/*`, and `@/assets/*` maps to `assets/*`.
