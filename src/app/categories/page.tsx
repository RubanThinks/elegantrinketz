import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/services/categories";
import { EmptyState } from "@/components/common/empty-state";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Categories",
  description:
    "Browse by category — Side Cut Kurtis, Umbrella Kurtis, 3 Piece Sets, Straight Pants, Shimmer Leggings, and Accessories.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Curated Categories
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
            Explore By Silhouette
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            Distinct design languages crafted for everyday elegance and grand occasions.
          </p>
        </div>

        {/* Categories Visual Grid or Empty State */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group relative aspect-[4/5] bg-neutral-100 overflow-hidden block"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                {/* Subtle gradient vignette for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/20 to-transparent transition-opacity group-hover:from-neutral-950/85" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1">
                  <span className="text-[11px] uppercase tracking-widest text-neutral-300">
                    {category.productCount ? `${category.productCount} Designs` : "Artisanal Selection"}
                  </span>
                  <h2 className="text-2xl font-serif font-medium tracking-tight">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs text-neutral-300 line-clamp-2 font-light pt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Categories Found"
            description="Our collections and silhouettes are currently being curated. Please check back shortly."
            actionHref="/shop"
            actionText="Explore Shop"
          />
        )}
      </div>
    </div>
  );
}
