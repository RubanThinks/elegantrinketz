import React from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = buildPageMetadata({
  title: "My Wishlist",
  description: "View and manage your saved garments and couture pieces.",
  path: "/wishlist",
  noIndex: true,
});

export default function WishlistPage() {
  return (
    <div className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Personal Curation
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            Garments you have bookmarked for upcoming celebrations and occasions.
          </p>
        </div>

        <WishlistView />
      </div>
    </div>
  );
}
