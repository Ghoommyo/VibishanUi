# Vibishan: overview of the build plan

## Context
Vibishan is still the `create-expo-app` starter (Expo SDK 57, Expo Router, React Compiler, typed routes). The goal is the real product on Android, iOS and web. Users ask Listeners for a 1:1 listening session, or ask Moderators to run a moderated group session with other users. Every session goes through approval, then a group chat, closing notes and ratings, and finally a summary.

The backend is mocked for now: a typed in-app API layer backed by AsyncStorage and seed data. It is shaped so a real backend can replace it later without touching any screen.

## Decisions
- Account types are **User, Listener and Moderator**, chosen at signup and login.
- The dummy API is **in-app and persisted** (AsyncStorage). To test multi-user flows, log out and log in as another seeded account.
- The "splash" is a **single intro page**. The native splash screen stays as it is.
- Charts are **custom, built on react-native-svg**. There is no chart library.

## SDK 57 facts checked in the docs
- The drawer comes from `expo-router/drawer`. Its dependencies (reanimated, worklets, gesture-handler) are already installed.
- `Stack.Protected guard={...}` is available, but `redirectTo` only arrives in SDK 58, so blocked routes fall back to `index`.
- `@react-native-async-storage/async-storage` and `react-native-svg` both support web and Expo Go.

## New dependencies
`npx expo install @react-native-async-storage/async-storage react-native-svg` (done in phase 1)

## Route tree (`src/app/`)
```
_layout.tsx                 Providers (Prefs, Session, ThemeProvider) + root <Stack>; holds native splash until session hydrated
index.tsx                   <Redirect> → /home if session, else /welcome
welcome.tsx                 Intro page
login.tsx, signup.tsx       <Stack.Protected guard={!session}>
(app)/_layout.tsx           <Stack.Protected guard={!!session}>; Stack holding the drawer group + detail screens
(app)/(drawer)/_layout.tsx  <Drawer> with custom content + NotificationBell in headerRight
(app)/(drawer)/home.tsx     user → RequestServiceForm, listener/moderator → ProviderAnalytics
(app)/(drawer)/chats.tsx    Chatroom list
(app)/(drawer)/profile.tsx
(app)/(drawer)/settings.tsx
(app)/notifications.tsx
(app)/chat/[id]/index.tsx   Chatroom
(app)/chat/[id]/summary.tsx Summary
```

## Phases
| # | File | Scope |
|---|------|-------|
| 1 | [01-api-layer.md](01-api-layer.md) | Dependencies, types, db, seed, API modules, business rules |
| 2 | [02-auth-and-routing.md](02-auth-and-routing.md) | Providers, root layout, protected routes, welcome, login and signup |
| 3 | [03-drawer-profile-settings.md](03-drawer-profile-settings.md) | Drawer shell, notification bell, profile, settings |
| 4 | [04-requests-and-notifications.md](04-requests-and-notifications.md) | User dashboard, request flow, notifications and approvals |
| 5 | [05-chatrooms.md](05-chatrooms.md) | Chatroom list, chatroom, closure, mute, rating, summary |
| 6 | [06-provider-analytics.md](06-provider-analytics.md) | Listener and moderator dashboard with charts |
| 7 | [07-cleanup-and-verification.md](07-cleanup-and-verification.md) | Delete template files, update docs, end-to-end verification |

## Cross-cutting conventions
- All business logic lives in `src/api/`. Screens call API functions through the `useApi` hook and never change the data directly.
- The UI is built from the existing `ThemedText`, `ThemedView`, `useTheme` and `Spacing`/`Colors`/`MaxContentWidth` tokens in `src/constants/theme.ts`. `Colors` gains `primary`, `danger`, `success` and `border` in **both** the light and dark palettes.
- Content is centred and capped at `MaxContentWidth` on web.
- Icons use `SymbolView` from `expo-symbols` with a per-platform name map. Check the v57 docs for Android and web support first, and fall back to text or SVG glyphs if it's missing.
- Run `npx tsc --noEmit` and `npx expo lint` at the end of every phase.
