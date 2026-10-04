import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PrefsProvider } from '@/providers/prefs';
import { SessionProvider, useSession } from '@/providers/session';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PrefsProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </PrefsProvider>
    </GestureHandlerRootView>
  );
}

function navigationTheme(scheme: 'light' | 'dark'): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };
}

function RootNavigator() {
  const { user, isLoading } = useSession();
  const scheme = useColorScheme();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  // Keep the native splash up until we know whether there's a session.
  if (isLoading) return null;

  return (
    <ThemeProvider value={navigationTheme(scheme)}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!user}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
