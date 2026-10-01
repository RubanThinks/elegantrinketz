"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { getFriendlyAuthErrorMessage } from "@/lib/firebase/errors";
import { Eye, EyeOff, AlertCircle, Check, X } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter", passed: /[a-z]/.test(password) },
    { label: "Number", passed: /\d/.test(password) },
  ];

  if (!password) return null;

  const passedCount = checks.filter((c) => c.passed).length;
  const strength = passedCount <= 1 ? "Weak" : passedCount <= 3 ? "Fair" : "Strong";
  const strengthColor =
    passedCount <= 1 ? "text-red-600" : passedCount <= 3 ? "text-amber-600" : "text-emerald-600";
  const barColor =
    passedCount <= 1 ? "bg-red-400" : passedCount <= 3 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < passedCount ? barColor : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-semibold ${strengthColor}`}>{strength}</span>
      </div>
      <ul className="space-y-0.5">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-1.5 text-[11px]">
            {check.passed ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <X className="w-3 h-3 text-neutral-300" />
            )}
            <span className={check.passed ? "text-neutral-600" : "text-neutral-400"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RegisterPage() {
  const { signUpWithEmail, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      setErrorMessage("Please meet all password requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signUpWithEmail(email, password, fullName, phone || undefined);
      router.push(redirectTo);
    } catch (err) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="py-14 sm:py-20 bg-background flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-8">
          <Link href="/" className="inline-block">
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
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Join {siteConfig.name} and discover your personal style.
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

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="register-name"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-phone"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
              >
                Phone Number <span className="text-neutral-400 text-[10px] normal-case">(optional)</span>
              </label>
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-colors"
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
              <PasswordStrength password={password} />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm"
                className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
              >
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-11 bg-white border rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-1 transition-colors ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-neutral-300 focus:border-rose-600 focus:ring-rose-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-red-600 mt-1">Passwords do not match.</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!passwordValid}
              className="w-full font-semibold"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <span>Already have an account? </span>
            <Link
              href={`/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className="font-semibold text-neutral-900 hover:text-rose-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
