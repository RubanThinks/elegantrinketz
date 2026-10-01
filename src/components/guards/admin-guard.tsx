"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
  /** Where to redirect non-admin users. Defaults to /admin/login */
  loginPath?: string;
  /** Fallback UI while checking auth state */
  fallback?: React.ReactNode;
}

/**
 * Client-side route guard for admin-only pages.
 * Redirects unauthenticated users to admin login,
 * and shows access denied for non-admin authenticated users.
 */
export function AdminGuard({
  children,
  loginPath = "/admin/login",
  fallback,
}: AdminGuardProps) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [loading, isAuthenticated, router, loginPath]);

  if (loading || !isAuthenticated) {
    return (
      fallback ?? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      )
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Access Denied</h2>
          <p className="text-sm text-neutral-500">
            {user?.email ? (
              <>
                <span className="font-medium text-neutral-700">{user.email}</span> does not
                have admin privileges.
              </>
            ) : (
              "Your account does not have admin privileges."
            )}
          </p>
          <Button variant="outline" size="md" onClick={() => router.push("/")}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
