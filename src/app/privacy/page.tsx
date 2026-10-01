import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="py-12 sm:py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-serif text-neutral-900 tracking-tight text-center">
          Privacy Policy
        </h1>
        <div className="bg-white border border-neutral-200/80 p-8 space-y-4 text-sm text-neutral-600 leading-relaxed font-light">
          <p>
            At {siteConfig.name}, we value your privacy and trust. This policy describes how we collect,
            use, and protect your personal information when you browse our boutique or make inquiries.
          </p>
          <h2 className="text-base font-serif text-neutral-900 pt-2 font-medium">Information We Collect</h2>
          <p>
            We collect contact details such as name, email, phone number, and delivery address solely
            to fulfill your orders and respond to styling requests. We never sell your personal data.
          </p>
        </div>
      </div>
    </div>
  );
}
