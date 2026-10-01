"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to /login */
  redirectTo?: string;
  /** Fallback UI while checking auth state */
  fallback?: React.ReactNode;
}

/**
 * Client-side route guard that redirects unauthenticated users.
 * Wraps page content that requires a signed-in user.
 */
export function AuthGuard({
  children,
  redirectTo = "/login",
  fallback,
}: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      const url =
        currentPath && currentPath !== redirectTo
          ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
          : redirectTo;

      router.replace(url);
    }
  }, [loading, isAuthenticated, redirectTo, router]);

  if (loading || !isAuthenticated) {
    return (
      fallback ?? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      )
    );
  }

  return <>{children}</>;
}
