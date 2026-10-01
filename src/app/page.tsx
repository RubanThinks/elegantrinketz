import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import { Hero } from "@/components/layout/hero";
import { CategoryStory } from "@/components/category/category-story";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductCarousel } from "@/components/product/product-carousel";
import { EditorialBanner } from "@/components/layout/editorial-banner";
import { CampaignBanner } from "@/components/layout/campaign-banner";
import { InstagramSection } from "@/components/layout/instagram-section";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/services/categories";
import { getProducts, toProductCardData } from "@/services/products";

export default async function HomePage() {
  const [newArrivalsRes, bestSellersRes, categories] = await Promise.all([
    getProducts({ isNew: true, limit: 4 }),
    getProducts({ isBestSeller: true, limit: 8 }),
    getCategories(),
  ]);

  const newArrivals = newArrivalsRes.products.map(toProductCardData);
  const bestSellers = bestSellersRes.products.map(toProductCardData);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section — Elegant Trinketz Fashion Hero */}
      <Hero
        headline="Elegance in Every Dress"
        description="Discover styles designed to make every occasion feel special."
        ctaText="Shop Collection"
        ctaHref="/shop"
        secondaryCtaText="Explore Categories"
        secondaryCtaHref="/categories"
      />

      {/* 2. Shop by Category — Circular Stories */}
      <CategoryStory categories={categories} />

      {/* 3. New Arrivals Section */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Just Landed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1a1a] tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop/collection/new-arrivals"
              className="group inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:text-[#D4AF37] transition-colors"
            >
              <span>Explore All New</span>
              <ArrowRight className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* 4. Editorial / Campaign Section */}
      <EditorialBanner />

      {/* 5. Trending & Best Sellers — Product Carousel */}
      <section className="py-14 sm:py-20 bg-[#fff9f5] border-y border-[#e8e0d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
                <Flame className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                <span>Popular Picks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1a1a] tracking-tight">
                Trending at {siteConfig.name}
              </h2>
            </div>
            <Link
              href="/shop/collection/best-sellers"
              className="group inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:text-[#D4AF37] transition-colors"
            >
              <span>View All Bestsellers</span>
              <ArrowRight className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ProductCarousel products={bestSellers} />
        </div>
      </section>

      {/* 6. WhatsApp Shopping CTA */}
      <CampaignBanner />

      {/* 7. Why Elegant Trinketz */}
      <InstagramSection />
    </div>
  );
}
