"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { getFriendlyAuthErrorMessage } from "@/lib/firebase/errors";
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-background flex items-center justify-center">
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
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          {isSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">Check Your Inbox</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  We have sent a secure password reset link to{" "}
                  <span className="font-semibold text-neutral-900">{email}</span>. Please click the link in that email to proceed.
                </p>
              </div>
              <div className="pt-3">
                <Link href="/login">
                  <Button variant="outline" size="md" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="reset-email"
                  className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold"
                >
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-colors"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full font-semibold"
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-neutral-400">
          Need further help? Contact {siteConfig.name} concierge at{" "}
          <a href={`mailto:${siteConfig.email}`} className="underline text-neutral-600">
            {siteConfig.email}
          </a>
        </div>
      </div>
    </div>
  );
}
