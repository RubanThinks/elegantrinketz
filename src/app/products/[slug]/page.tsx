import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import { getProductBySlug, getRelatedProducts, toProductCardData } from "@/services/products";
import { Badge } from "@/components/ui/badge";
import { JsonLd, getProductSchema, getBreadcrumbSchema } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductDetailActions } from "@/components/product/product-detail-actions";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductReviews } from "@/components/product/product-reviews";
import { siteConfig } from "@/config/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return buildPageMetadata({ title: "Product Not Found" });
  }

  return buildPageMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${product.slug}`,
    image: product.images?.primary,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Compile full image list with primary first
  const rawUrls: string[] = [];
  if (product.images?.primary) rawUrls.push(product.images.primary);
  if (product.images?.hover) rawUrls.push(product.images.hover);
  if (Array.isArray(product.images?.gallery)) {
    rawUrls.push(...product.images.gallery);
  }
  if (Array.isArray(product.media)) {
    product.media.forEach((m) => {
      if (m.url && !rawUrls.includes(m.url)) {
        rawUrls.push(m.url);
      }
    });
  }

  // Deduplicate and fallback
  const imageUrls = Array.from(new Set(rawUrls.filter(Boolean)));
  if (imageUrls.length === 0) {
    imageUrls.push("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80");
  }

  // Fetch related products
  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const relatedCardData = related.map(toProductCardData);

  const productSchema = getProductSchema(product);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
  ];
  if (product.categorySlug) {
    breadcrumbItems.push({
      name: product.categoryName || product.categorySlug.replace(/-/g, " "),
      url: `/shop/${product.categorySlug}`,
    });
  }
  breadcrumbItems.push({
    name: product.name,
    url: `/products/${product.slug}`,
  });
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="py-10 sm:py-16 bg-white">
      <JsonLd schema={productSchema} />
      <JsonLd schema={breadcrumbSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs uppercase tracking-wider text-[#b8a99c] mb-8 flex items-center space-x-2"
        >
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#1a1a1a] transition-colors">
            Shop
          </Link>
          {product.categorySlug && (
            <>
              <span>/</span>
              <Link
                href={`/shop/${product.categorySlug}`}
                className="hover:text-[#1a1a1a] transition-colors capitalize"
              >
                {product.categoryName || product.categorySlug.replace(/-/g, " ")}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left Column: Interactive Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={imageUrls} productName={product.name} />
          </div>

          {/* Right Column: Product Specs & Ordering Actions */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">
            {/* Badges */}
            <div className="flex items-center gap-2">
              {product.isOutOfStock ? (
                <Badge variant="outOfStock">Out of Stock</Badge>
              ) : (
                <>
                  {product.isNew && <Badge variant="default" className="bg-[#111] text-white border-none rounded-sm">New Arrival</Badge>}
                  {product.isBestSeller && (
                    <Badge variant="secondary" className="bg-[#D4AF37] text-[#111] border-none rounded-sm">Bestseller</Badge>
                  )}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <Badge variant="sale" className="bg-[#E9A0B8] text-white border-none rounded-sm">
                      Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </Badge>
                  )}
                </>
              )}
            </div>

            {/* Brand & Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flipkart-brand-title text-rose-600 font-semibold">
                  Brand: {siteConfig.name}
                </span>
                {product.sku && (
                  <span className="text-[11px] text-[#878787] font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-flipkart font-medium text-[#0f1111] tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Customer Feedback Link */}
              <div className="flex items-center gap-2 pt-0.5 text-xs text-neutral-500 font-flipkart">
                <a
                  href="#customer-reviews"
                  className="text-rose-600 hover:text-rose-700 hover:underline font-medium"
                >
                  Customer Reviews &amp; Ratings
                </a>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Verified Boutique Design</span>
              </div>
            </div>

            {/* Interactive Actions (Pricing, Size Selector, Cart & WhatsApp Enquiry) */}
            <ProductDetailActions product={product} />

            {/* Description Details */}
            {product.description && (
              <div className="space-y-2 pt-4 border-t border-[#e8e0d8]">
                <h3 className="text-xs uppercase tracking-widest text-[#b8a99c] font-medium">
                  The Details
                </h3>
                <p className="text-sm text-[#666] leading-relaxed font-light whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Elegant _Trinketz Product Quality Assured Guarantee */}
            <div className="pt-6 border-t border-[#e8e0d8] space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-white border border-rose-200/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 font-amazon">
                      Quality Assured
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                    Direct from our boutique in Salem, Tamil Nadu. Every piece is hand-inspected for stitching, fabric finish, and size accuracy before dispatch.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#666] pt-1">
                <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-neutral-50/80 border border-neutral-100">
                  <Truck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-[11px] font-medium text-neutral-800">Fast India Delivery</span>
                </div>
                <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-neutral-50/80 border border-neutral-100">
                  <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium text-neutral-800">WhatsApp Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Customer Reviews Section */}
        <ProductReviews
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
        />

        {/* You May Also Like Section */}
        {relatedCardData.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#e8e0d8] space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-8 h-px bg-[#D4AF37] mb-2" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1a1a] tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  You May Also Like
                </h2>
              </div>
              {product.categorySlug && (
                <Link
                  href={`/shop/${product.categorySlug}`}
                  className="text-xs uppercase tracking-wider text-[#D4AF37] hover:text-[#C9A227] font-medium"
                >
                  View All in Category &rarr;
                </Link>
              )}
            </div>

            <ProductGrid products={relatedCardData} />
          </div>
        )}
      </div>
    </div>
  );
}
