import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { authApi, usersApi, type PublicUser, type Role } from '@/api';
import type { SignupInput } from '@/api/auth';

const KEY = 'vibishan.session.userId';

type SessionContextValue = {
  user: PublicUser | null;
  isLoading: boolean;
  signIn: (username: string, password: string, role: Role) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-reads the current user after profile or settings changes. */
  refreshUser: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const id = await AsyncStorage.getItem(KEY);
        if (id) setUser(await authApi.restoreSession(id));
      } catch {
        // Treat unreadable storage as logged out.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const startSession = async (next: PublicUser) => {
    await AsyncStorage.setItem(KEY, next.id);
    setUser(next);
  };

  const value: SessionContextValue = {
    user,
    isLoading,
    signIn: async (username, password, role) => startSession(await authApi.login(username, password, role)),
    signUp: async (input) => startSession(await authApi.signup(input)),
    signOut: async () => {
      await authApi.logout();
      await AsyncStorage.removeItem(KEY);
      setUser(null);
    },
    refreshUser: async () => setUser(await usersApi.getMe()),
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

/** For screens inside the authenticated group, where a user is guaranteed. */
export function useCurrentUser(): PublicUser {
  const { user } = useSession();
  if (!user) throw new Error('useCurrentUser used outside the authenticated routes');
  return user;
}
