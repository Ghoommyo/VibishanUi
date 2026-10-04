# Phase 7: Cleanup and end-to-end verification

## Cleanup
- Delete these template files:
  - `src/app/explore.tsx`
  - `src/components/app-tabs.tsx` and `app-tabs.web.tsx`
  - `hint-row.tsx`, `web-badge.tsx`, `animated-icon*`, `ui/collapsible.tsx`
  - `assets/images/tabIcons/`, and any template-only images nothing references any more
- Remove the `reset-project` script and `scripts/reset-project.js`.
- Update the Architecture section of `CLAUDE.md` to cover the route tree, the `src/api` mock backend and its rules, the providers, `useApi`, and the demo accounts.

## Checks
- `npx tsc --noEmit`
- `npx expo lint`
- `npx expo-doctor`

## Manual scenarios
Run these on web (`npx expo start --web`), then spot-check iOS and Android in Expo Go:
1. Sign up a new user. Check that a duplicate username or email is rejected.
2. Log in as alice and send listen requests to lisa and leo. Two pending rows appear.
3. Log in as lisa and accept. The room becomes active. Chat, then star messages.
4. Log in as alice and submit a conclusion; the input is now disabled. Rate lisa, then check the summary.
5. Log in as alice and send a moderate request to maya with bob. Maya doesn't see it until bob accepts.
6. Log in as maya and accept. Mute bob and check that bob's Send button is disabled. Give a verdict: the room closes for everyone, and the rating dialog appears for alice and bob.
7. Log in as maya and check that the analytics show the new session and rating.
8. Switch the theme in Settings, use Reset demo data, and check that the drawer is permanent on wide web screens.

## Status (2026-10-04)
All seven phases are implemented and pushed.
- Template components and images were removed during Phase 5, once typed routes started flagging the old `/explore` link. `scripts/reset-project.js` was removed in this phase.
- `tsc`, `expo lint` and `expo-doctor` (21/21) pass. The app bundles for iOS and Android with `expo export`.
- Scenarios 1–7 and the wide-screen drawer were driven end to end in headless Chrome against the web build, and the analytics charts were checked in light and dark mode. iOS and Android have **not** been tried on a device or simulator yet.
