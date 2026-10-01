import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Cookie Policy",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <div className="py-12 sm:py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-serif text-neutral-900 tracking-tight text-center">
          Cookie Policy
        </h1>
        <div className="bg-white border border-neutral-200/80 p-8 space-y-4 text-sm text-neutral-600 leading-relaxed font-light">
          <p>
            {siteConfig.name} uses essential session cookies to remember shopping bag preferences
            and facilitate secure authentication. We do not use intrusive third-party cross-site tracking cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
