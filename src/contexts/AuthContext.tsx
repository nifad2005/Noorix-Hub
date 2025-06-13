
"use client";

import type { ReactNode } from "react";
import { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth status from localStorage or an API
    try {
      const storedUser = localStorage.getItem("noorixUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("noorixUser");
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("noorixUser", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    router.push("/profile"); // Changed to redirect to profile
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("noorixUser");
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

