"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import type { AuthSession } from "@/lib/types";

interface AuthContextType {
  session: AuthSession | null;
  user: AuthSession["user"] | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlan: "free" | "basic" | "premium";
  hasPermission: (permission: string) => boolean;
  canCreateListing: boolean;
  requireAuth: (redirectTo?: string) => void;
  requireGuest: () => void;
  updateSession: () => Promise<AuthSession | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  session?: AuthSession | null;
}

function AuthProviderInner({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
