# Phase 3: Drawer shell, profile and settings

## Files
- `src/app/(app)/_layout.tsx`: a Stack with the `(drawer)` group (header hidden) plus `notifications`, `chat/[id]/index` and `chat/[id]/summary`.
- `src/app/(app)/(drawer)/_layout.tsx`:
  - `<Drawer>` from `expo-router/drawer`, with screens home, chats, profile and settings.
  - `headerRight` is the `NotificationBell`, with an unread badge that polls every 3s and links to `/notifications`.
  - On wide web screens (1024px and up) the drawer is permanent.
- `src/components/drawer-content.tsx`: avatar, name and role at the top, then Profile, Settings, and Logout, which calls `signOut`.
- `src/app/(app)/(drawer)/profile.tsx`:
  - Read-only: username, role badge, member since, and average rating for providers.
  - Editable with edit and save: name, contact number, email, bio, and areas of expertise (providers only).
- `src/app/(app)/(drawer)/settings.tsx`:
  - Appearance: System, Light or Dark (via `PrefsProvider`).
  - Notification toggles: request updates (unread badge for accept/decline updates), message previews in the chatroom list.
  - "Available for new requests" (providers only; hides the account from the dropdown).
  - App version from `expo-constants`.
  - "Reset demo data" (`resetDb()`) and Logout.
- Shared components: `Avatar`, `NotificationBell`.
- Placeholders for `home.tsx` and `chats.tsx`; phases 4 to 6 fill them in.

## Done when
The drawer works on all platforms. Profile edits persist after a reload. The theme switch updates the UI straight away.
