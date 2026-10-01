import React from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Returns & Exchanges",
  path: "/returns",
});

export default function ReturnsPage() {
  return (
    <div className="py-12 sm:py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Client Services
          </span>
          <h1 className="text-3xl font-serif text-neutral-900 tracking-tight">
            Returns & Exchanges Policy
          </h1>
        </div>

        <div className="bg-white border border-neutral-200/80 p-8 space-y-6 text-sm text-neutral-600 leading-relaxed font-light">
          <section className="space-y-2">
            <h2 className="text-base font-serif text-neutral-900 font-medium">7-Day Complimentary Exchange</h2>
            <p>
              We want you to be completely enamored with your fit. Standard ready-to-wear items can be
              exchanged within 7 days of delivery in their original unworn condition with security tags intact.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif text-neutral-900 font-medium">Custom Tailored & Bridal Pieces</h2>
            <p>
              Due to individual measurements, custom-tailored lehengas and personalized blouses cannot be returned.
              However, we provide complimentary fitting adjustments at our atelier.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
