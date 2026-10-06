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
        {/* E-Commerce Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-neutral-200 pb-4 mb-6 gap-2">
          <div>
            <nav className="text-[11px] font-medium text-neutral-500 mb-1">
              <span>Home</span> <span className="mx-1">/</span> <span className="text-neutral-900 font-semibold">Shop</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-flipkart">
              All Products
            </h1>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            Showing {allProducts.length} styles
          </span>
        </div>

        {/* Dynamic Shop Catalog with Filtering and Sorting */}
        <ShopCatalog initialProducts={allProducts} categories={categories} />
      </div>
    </div>
  );
}
