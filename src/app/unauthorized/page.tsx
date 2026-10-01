import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Access Restricted",
  description: "You do not have permission to access this area of the application.",
  path: "/unauthorized",
  noIndex: true,
});

export default function UnauthorizedPage() {
  return (
    <div className="py-20 sm:py-28 bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed font-normal">
            You do not have permission to view or manage this administrative area.
            Please verify you are signed in with the correct staff credentials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/">
            <Button variant="primary" size="md" className="w-full sm:w-auto px-6 font-semibold">
              <Home className="w-4 h-4 mr-2" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="md" className="w-full sm:w-auto px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Sign In As Another User</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
