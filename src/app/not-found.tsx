import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 text-center bg-background">
      <div className="max-w-md mx-auto space-y-6">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
          404 Error
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight leading-snug">
          We Couldn&apos;t Find That Page
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed font-light">
          The garment or editorial page you are looking for may have been moved,
          archived, or is temporarily unavailable.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="md">
              Return Home
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="md">
              Browse Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
