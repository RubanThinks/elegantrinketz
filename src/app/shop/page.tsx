import React from "react";
import type { Metadata } from "next";
import { getProducts, toProductCardData } from "@/services/products";
import { getCategories } from "@/services/categories";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Shop All Products",
  description:
    `Explore our complete collection of kurtis, 3-piece sets, straight pants, shimmer leggings and more at ${siteConfig.name}.`,
  path: "/shop",
});

export default async function ShopPage() {
  const [productsRes, categories] = await Promise.all([
    getProducts({ limit: 60 }),
    getCategories(),
  ]);

  const allProducts = productsRes.products.map((p) => {
    const cardData = toProductCardData(p);
    return {
      ...cardData,
      categoryId: p.categoryId,
      categorySlug: p.categorySlug,
      createdAt: p.createdAt,
    };
  });

  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <div className="w-10 h-px bg-[#D4AF37] mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            Shop All
          </h1>
          <p className="text-sm text-[#666] leading-relaxed font-light">
            Explore our complete collection of thoughtfully styled women&apos;s fashion.
          </p>
        </div>

        {/* Dynamic Shop Catalog with Filtering and Sorting */}
        <ShopCatalog initialProducts={allProducts} categories={categories} />
      </div>
    </div>
  );
}
