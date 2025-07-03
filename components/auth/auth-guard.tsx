"use client";

import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  requireEmailVerified?: boolean;
  requiredRoles?: UserRole[];
  fallbackPath?: string;
  loadingComponent?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireGuest = false,
  requireEmailVerified = false,
  requiredRoles = [],
  fallbackPath,
  loadingComponent,
}: AuthGuardProps) {
  const { t } = useTranslation(["auth", "common"]);
  const router = useRouter();
  const {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    isEmailVerified,
  } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Redirect unauthenticated users if auth is required
    if (requireAuth && isUnauthenticated) {
      const currentPath = window.location.pathname;
      const callbackUrl = encodeURIComponent(currentPath);
      router.push(fallbackPath || `/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    // Redirect authenticated users if guest access only
    if (requireGuest && isAuthenticated) {
      router.push(fallbackPath || "/");
      return;
    }

    // Check email verification requirement
    if (
      requireAuth &&
      isAuthenticated &&
      requireEmailVerified &&
      !isEmailVerified
    ) {
      router.push(fallbackPath || "/auth/verify-email");
      return;
    }

    // Check role requirements
    if (requireAuth && isAuthenticated && requiredRoles.length > 0) {
      if (!user || !requiredRoles.includes(user.role)) {
        router.push(fallbackPath || "/unauthorized");
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    isEmailVerified,
    requireAuth,
    requireGuest,
    requireEmailVerified,
    requiredRoles,
    user,
    router,
    fallbackPath,
  ]);

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common:loading")}</p>
        </div>
      </div>
    );
  }

  // Don't render if redirecting
  if (requireAuth && isUnauthenticated) return null;
  if (requireGuest && isAuthenticated) return null;
  if (
    requireAuth &&
    isAuthenticated &&
    requireEmailVerified &&
    !isEmailVerified
  )
    return null;
  if (
    requireAuth &&
    isAuthenticated &&
    requiredRoles.length > 0 &&
    (!user || !requiredRoles.includes(user.role))
  )
    return null;

  return <>{children}</>;
}
