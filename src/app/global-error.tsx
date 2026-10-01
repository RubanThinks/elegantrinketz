"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 flex items-center justify-center p-6 text-neutral-900 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-serif tracking-tight">
            Critical Application Error
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            An unexpected error occurred. Please refresh the page to restart the application.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 bg-neutral-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors"
          >
            Restart Application
          </button>
        </div>
      </body>
    </html>
  );
}
