
"use client";

import type { ReactNode } from "react";
import { createContext, useCallback } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface User {
  id?: string | null; // Added id from the database session
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  session: Session | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderContent({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const user: User | null = session?.user
    ? {
        id: session.user.id, // id is now available via augmented Session type
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image, 
      }
    : null;

  const login = useCallback(() => {
    signIn("google", { callbackUrl: "/profile" });
  }, []);

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
}
