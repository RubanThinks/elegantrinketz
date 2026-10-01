"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service without exposing raw internals to client
    console.error("Storefront Application Error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 text-center bg-background">
      <div className="max-w-md mx-auto space-y-6">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
          Temporary Interruption
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight leading-snug">
          Something Went Wrong
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed font-light">
          We encountered an unexpected error while preparing your shopping experience.
          Please try again or return to the main storefront.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="md">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
