import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { authApi, onUnauthorized, usersApi, type PublicUser, type Role, type SignupInput } from '@/api';

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
        setUser(await authApi.restoreSession());
      } catch {
        // Treat unreadable storage or an unreachable server as logged out.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // The server rejected the stored token (expired, or the account is gone): back to the login screens.
  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const value: SessionContextValue = {
    user,
    isLoading,
    signIn: async (username, password, role) => setUser(await authApi.login(username, password, role)),
    signUp: async (input) => setUser(await authApi.signup(input)),
    signOut: async () => {
      await authApi.logout();
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
