import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug } from "@/services/categories";
import { getProducts, toProductCardData } from "@/services/products";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, getBreadcrumbSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/config/site";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return buildPageMetadata({ title: "Category Not Found" });
  }

  return buildPageMetadata({
    title: `${category.name} — Handcrafted Silhouette`,
    description:
      category.description || `Discover our handcrafted collection of ${category.name}.`,
    path: `/shop/${category.slug}`,
    image: category.image,
  });
}

export default async function ShopCategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Fetch only published products for this active category
  const { products } = await getProducts({ categoryId: category.id, limit: 48 });
  const filteredProducts = products.map(toProductCardData);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} | ${siteConfig.name}`,
    description: category.description || `Handcrafted ${category.name} collection.`,
    url: `${siteConfig.url}/shop/${category.slug}`,
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: category.name, url: `/shop/${category.slug}` },
  ]);

  return (
    <div className="bg-background pb-16">
      <JsonLd schema={collectionSchema} />
      <JsonLd schema={breadcrumbSchema} />

      {/* Hero Banner if category has an image */}
      {category.image ? (
        <div className="relative w-full h-72 sm:h-96 bg-neutral-900 overflow-hidden mb-12">
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto space-y-3 text-white">
            <span className="text-[11px] uppercase tracking-widest text-neutral-300 font-medium">
              Curated Category
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif tracking-tight drop-shadow-sm">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-light line-clamp-3">
                {category.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-12 sm:pt-16 pb-8 max-w-xl mx-auto text-center px-4 space-y-3">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Category
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-neutral-600 leading-relaxed font-light">
              {category.description}
            </p>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Standardized Breadcrumbs: / -> /shop -> /shop/[category] */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs uppercase tracking-wider text-neutral-400 mb-8 flex items-center space-x-2"
        >
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-neutral-900 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{category.name}</span>
        </nav>

        {/* Count Bar */}
        <div className="flex items-center justify-between py-3 mb-8 border-y border-neutral-200/70 text-xs text-neutral-500 uppercase tracking-wider">
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Creation" : "Creations"}
          </span>
          <Link href="/shop" className="hover:text-neutral-900 transition-colors">
            View All Silhouettes &rarr;
          </Link>
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <EmptyState
            title={`No creations in ${category.name} currently`}
            description="Our master weavers are finishing new designs for this silhouette. Please check back shortly or explore our full collection."
            actionHref="/shop"
            actionText="Browse All Creations"
          />
        )}
      </div>
    </div>
  );
}
