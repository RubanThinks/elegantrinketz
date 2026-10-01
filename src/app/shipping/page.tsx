import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Shipping & Deliveries",
  path: "/shipping",
});

export default function ShippingPage() {
  return (
    <div className="py-12 sm:py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Client Services
          </span>
          <h1 className="text-3xl font-serif text-neutral-900 tracking-tight">
            Shipping & White-Glove Delivery
          </h1>
        </div>

        <div className="bg-white border border-neutral-200/80 p-8 space-y-6 text-sm text-neutral-600 leading-relaxed font-light">
          <section className="space-y-2">
            <h2 className="text-base font-serif text-neutral-900 font-medium">Domestic Shipping (India)</h2>
            <p>
              We provide complimentary insured courier shipping across all postal codes in India
              for orders above ₹999. In-stock ready-to-ship garments are dispatched within 24 to 48 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif text-neutral-900 font-medium">Made-to-Measure & Bridal Timelines</h2>
            <p>
              Hand-embroidered couture lehengas and custom-stitched Anarkalis typically require 3 to 4 weeks
              for artisanal creation. Sizing consultants will keep you updated throughout each handcrafting stage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-serif text-neutral-900 font-medium">Packaging</h2>
            <p>
              Every {siteConfig.name} order arrives in our signature breathable archival garment box with
              custom muslin dust covers to ensure pristine preservation of zari and embroidery.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
