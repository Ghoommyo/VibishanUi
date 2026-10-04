# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The rules in AGENTS.md (read the versioned Expo docs before touching any Expo/RN API, use `npx expo install`, never hand-edit `ios/`/`android/`) apply here. This project is on **Expo SDK 57** (React Native 0.86, React 19.2), so the docs to check are `https://docs.expo.dev/versions/v57.0.0/`.

## Commands

The package manager is npm (`package-lock.json`, no `bun.lock`).

```bash
npm start                # expo start (also: npm run ios | android | web)
npm run lint             # expo lint; no ESLint config is committed yet, so the first run scaffolds one
npx tsc --noEmit         # typecheck
npm run reset-project    # moves the starter src/ and scripts/ into example/ and creates a blank src/app
```

No test runner is set up yet. The README points to the Expo "Unit Testing with Jest" guide.

## Architecture

The repo is still the `create-expo-app` starter template with two tabs (Home, Explore).

- **Routing**: Expo Router, entry is `expo-router/entry`, and routes live in `src/app/`. `typedRoutes` and `reactCompiler` are enabled in `app.json` experiments. Because the React Compiler is on, don't add manual `useMemo`/`useCallback` without a reason.
- **Platform-specific files**: the template relies on `.web.tsx` / `.web.ts` overrides that Metro picks up automatically:
  - `src/components/app-tabs.tsx` uses `NativeTabs` from `expo-router/unstable-native-tabs` for native tab bars. `app-tabs.web.tsx` builds a custom top tab bar from `expo-router/ui` (`Tabs`/`TabList`/`TabTrigger`/`TabSlot`). When you add or rename a tab, update **both** files.
  - `src/hooks/use-color-scheme.web.ts` returns `'light'` until hydration, because web output is static (`web.output: "static"`).
  - `animated-icon.tsx` / `animated-icon.web.tsx` (the web version uses a CSS module).
- **Root layout** (`src/app/_layout.tsx`): it calls `SplashScreen.preventAutoHideAsync()` at module scope, wraps the app in the expo-router `ThemeProvider` (light/dark), and renders `AnimatedSplashOverlay` plus `AppTabs`.
- **Theming**: the design tokens live in `src/constants/theme.ts`: `Colors` (light/dark), `Fonts` (resolved per platform, with web using the CSS variables in `src/global.css`), `Spacing`, `BottomTabInset`, and `MaxContentWidth`. Build UI with `ThemedText` and `ThemedView` (`type` / `themeColor` props backed by `ThemeColor` keys) and the `useTheme()` hook rather than hard-coded colors. A new color must be added to both the `light` and `dark` palettes.
- **Path aliases** (`tsconfig.json`): `@/*` maps to `src/*` and `@/assets/*` maps to `assets/*`.
