import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCollectionBySlug } from "@/services/collections";
import { getProducts, toProductCardData } from "@/services/products";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, getBreadcrumbSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/config/site";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);

  if (!col) {
    return buildPageMetadata({ title: "Collection Not Found" });
  }

  return buildPageMetadata({
    title: `${col.name} Edit`,
    description: col.description || `Curated pieces from our ${col.name} collection.`,
    path: `/shop/collection/${slug}`,
    image: col.image,
  });
}

export default async function ShopCollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);

  if (!col) {
    notFound();
  }

  // Filter products by collection id (published only)
  const { products } = await getProducts({ collectionId: col.id, limit: 48 });
  const filteredProducts = products.map(toProductCardData);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${col.name} | ${siteConfig.name}`,
    description: col.description || `Curated pieces from our ${col.name} edit.`,
    url: `${siteConfig.url}/shop/collection/${col.slug}`,
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: col.name, url: `/shop/collection/${col.slug}` },
  ]);

  return (
    <div className="bg-background pb-16">
      <JsonLd schema={collectionSchema} />
      <JsonLd schema={breadcrumbSchema} />

      {/* Hero Header */}
      {col.image ? (
        <div className="relative w-full h-72 sm:h-96 bg-neutral-900 overflow-hidden mb-12">
          <Image
            src={col.image}
            alt={col.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto space-y-3 text-white">
            <span className="text-[11px] uppercase tracking-widest text-neutral-300 font-medium">
              Curated Edit
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif tracking-tight drop-shadow-sm">
              {col.name}
            </h1>
            {col.description && (
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-light line-clamp-3">
                {col.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-12 sm:pt-16 pb-8 max-w-xl mx-auto text-center px-4 space-y-3">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Curated Drop
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
            {col.name}
          </h1>
          {col.description && (
            <p className="text-sm text-neutral-600 leading-relaxed font-light">
              {col.description}
            </p>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Standardized Breadcrumbs */}
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
          <span className="text-neutral-900 font-medium">{col.name}</span>
        </nav>

        {/* Count Bar */}
        <div className="flex items-center justify-between py-3 mb-8 border-y border-neutral-200/70 text-xs text-neutral-500 uppercase tracking-wider">
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Creation" : "Creations"}
          </span>
          <Link href="/shop" className="hover:text-neutral-900 transition-colors">
            Explore All &rarr;
          </Link>
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <EmptyState
            title={`No products in ${col.name} currently`}
            description="We are preparing new arrivals for this collection. Please check back soon or explore our complete catalog."
            actionHref="/shop"
            actionText="Browse All Products"
          />
        )}
      </div>
    </div>
  );
}
