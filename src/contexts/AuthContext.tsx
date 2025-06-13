
"use client";

import type { ReactNode } from "react";
import { createContext, useCallback } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
// useRouter is not directly needed here anymore for login/logout redirects as next-auth handles it.

interface User {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void; // No userData needed for OAuth with Google
  logout: () => void;
  loading: boolean;
  session: Session | null; // Expose the raw session if needed
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Inner component to use useSession and provide context
function AuthProviderContent({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const user: User | null = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image, // Google provides 'image', map it to avatarUrl
      }
    : null;

  const login = useCallback(() => {
    // signIn will redirect to Google, then callback to /profile (or configured callback)
    // The callbackUrl in signIn options here can override the one in next-auth config if needed for specific login flows
    signIn("google", { callbackUrl: "/profile" });
  }, []);

  const logout = useCallback(() => {
    // signOut will clear the session and redirect to callbackUrl
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, session }}>
      {children}
    </AuthContext.Provider>
  );
}

// The main AuthProvider now wraps SessionProvider
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
}
