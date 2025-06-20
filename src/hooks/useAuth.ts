
"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import type { UserRole } from "@/config/roles"; // Import UserRole

// Ensure User interface in useAuth matches the one in AuthContext
interface User {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: UserRole | null; // Add role here as well
}

interface AuthContextTypeFromProvider {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  session: import("next-auth").Session | null;
}


export function useAuth() {
  const context = useContext(AuthContext as React.Context<AuthContextTypeFromProvider | undefined>);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

