import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-serif text-neutral-900 tracking-tight text-center">
          Terms of Service
        </h1>
        <div className="bg-white border border-neutral-200/80 p-8 space-y-4 text-sm text-neutral-600 leading-relaxed font-light">
          <p>
            Welcome to {siteConfig.name}. By accessing or using our website, you agree to comply with
            and be bound by these terms.
          </p>
          <h2 className="text-base font-serif text-neutral-900 pt-2 font-medium">Intellectual Property</h2>
          <p>
            All designs, garment silhouettes, editorial imagery, and textual content are the exclusive
            intellectual property of {siteConfig.name}.
          </p>
        </div>
      </div>
    </div>
  );
}
