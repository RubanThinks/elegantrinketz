"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { getFriendlyAuthErrorMessage } from "@/lib/firebase/errors";
import { Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const { signInWithEmail, user, profile, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && profile?.role === "admin") {
      router.replace("/admin");
    }
  }, [isAuthenticated, loading, profile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signInWithEmail(email, password);
      // Profile will be loaded by auth provider; the useEffect above handles redirect
    } catch (err) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show access denied if logged in but not admin
  if (!loading && isAuthenticated && user && profile && profile.role !== "admin") {
    return (
      <div className="py-14 sm:py-20 bg-background flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Access Denied</h1>
          <p className="text-sm text-neutral-500">
            Your account ({user.email}) does not have admin privileges.
          </p>
          <Button variant="outline" size="md" onClick={() => router.push("/")}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return null;

  return (
    <div className="py-14 sm:py-20 bg-background flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-8">
          <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-md mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px] flex items-center justify-center">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={60}
                height={60}
                priority
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Admin Access
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {siteConfig.name} Store Management
          </p>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full font-semibold bg-neutral-900 hover:bg-neutral-800"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-100">
            Protected area · Unauthorized access is logged
          </div>
        </div>
      </div>
    </div>
  );
}
