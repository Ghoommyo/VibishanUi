# Phase 2: Auth, providers and routing

## Goal
Set up session handling and protected routes, plus the intro, login and signup screens.

## Files
- `src/providers/session.tsx`: `SessionProvider` stores the userId in AsyncStorage and exposes `{user, isLoading, signIn, signUp, signOut, refreshUser}`.
- `src/providers/prefs.tsx`: `PrefsProvider` holds the theme override (`system | light | dark`). Update `src/hooks/use-color-scheme(.web).ts` and `use-theme.ts` to respect it, so the existing themed components follow it.
- `src/hooks/use-api.ts`: `useApi(fn, deps, {pollMs?})` returns `{data, error, loading, refetch}` and refetches on focus via `useFocusEffect`.
- `src/app/_layout.tsx`:
  - Wrap the app in Prefs, then Session, then the expo-router `ThemeProvider`.
  - Keep `SplashScreen.preventAutoHideAsync()` and call `hideAsync()` once the session has hydrated.
  - The root `<Stack>` uses `Stack.Protected guard={!session}` around `login`/`signup` and `guard={!!session}` around `(app)`.
- `src/app/index.tsx`: `<Redirect>` to `/home` when there's a session, otherwise to `/welcome`.
- `src/app/welcome.tsx`: a single intro page with two feature cards ("Connect to listeners", "Connect to moderators") and Login and Sign up buttons.
- `src/app/login.tsx`:
  - Fields: username, password, and Type as a `SegmentedControl` (User, Listener, Moderator).
  - The "Not a member? Sign up" link goes to signup.
  - Demo-account chips fill in the credentials.
- `src/app/signup.tsx`:
  - Fields: username, email, Type, password, and confirm password.
  - The "Already a member? Log in" link goes to login.
  - Checks on the device: email format, password length (at least 8), and that the passwords match. Uniqueness errors come back from the API and show inline.
- Shared components: `Button`, `TextField`, `SegmentedControl`.

## Done when
Signup, login and logout work on web. A duplicate username or email is rejected. Picking the wrong role at login gives an error. Reloading keeps you logged in.
