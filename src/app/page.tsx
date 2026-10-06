import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import { Hero } from "@/components/layout/hero";
import { CategoryStory } from "@/components/category/category-story";
import { ServiceAssuranceBar } from "@/components/home/service-assurance-bar";
import { FlashDeals } from "@/components/home/flash-deals";
import { CategoryGrid } from "@/components/home/category-grid";
import { BudgetStore } from "@/components/home/budget-store";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductCarousel } from "@/components/product/product-carousel";
import { CampaignBanner } from "@/components/layout/campaign-banner";
import { getCategories } from "@/services/categories";
import { getProducts, toProductCardData } from "@/services/products";
import { getHeroSlides, getDealOfTheDaySettings } from "@/services/storefront";

export default async function HomePage() {
  const [
    newArrivalsRes,
    bestSellersRes,
    allProductsRes,
    categories,
    heroSlides,
    dealSettings,
  ] = await Promise.all([
    getProducts({ isNew: true, limit: 4 }),
    getProducts({ isBestSeller: true, limit: 8 }),
    getProducts({ limit: 12 }),
    getCategories(),
    getHeroSlides(),
    getDealOfTheDaySettings(),
  ]);

  const newArrivals = newArrivalsRes.products.map(toProductCardData);
  const bestSellers = bestSellersRes.products.map(toProductCardData);
  const allCardProducts = allProductsRes.products.map(toProductCardData);

  // If dealSettings specifies custom productIds, prioritize those products
  let dealProducts = allCardProducts;
  if (dealSettings.productIds && dealSettings.productIds.length > 0) {
    const selected = allCardProducts.filter((p) =>
      dealSettings.productIds.includes(p.id)
    );
    if (selected.length > 0) {
      dealProducts = selected;
    }
  }

  return (
    <div className="flex flex-col w-full bg-white">
      {/* 1. Quick Category Story Strip */}
      <CategoryStory categories={categories} />

      {/* 2. High-Converting Promotional Hero Banner Carousel (Admin Customizable) */}
      <Hero initialSlides={heroSlides} />

      {/* 3. Solid E-Commerce Service Guarantees Strip (Mobile text cut-off resolved) */}
      <ServiceAssuranceBar />

      {/* 4. ⚡ Flash Deals / Deal of the Day with Real Countdown (Admin Customizable) */}
      <FlashDeals products={dealProducts} initialSettings={dealSettings} />

      {/* 5. Shop by Category Visual Department Tiles */}
      <CategoryGrid />

      {/* 6. Trending Best Sellers — Product Carousel */}
      <section className="py-10 sm:py-14 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff9f00] font-flipkart mb-1">
                <Flame className="w-3.5 h-3.5 fill-[#ff9f00]" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-flipkart">
                Trending Bestsellers
              </h2>
            </div>
            <Link
              href="/shop/collection/best-sellers"
              className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-red-600 transition-colors"
            >
              <span>View All Bestsellers</span>
              <ArrowRight className="ml-1 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ProductCarousel
            products={bestSellers.length > 0 ? bestSellers : allCardProducts.slice(0, 8)}
          />
        </div>
      </section>

      {/* 7. Budget Store · Shop by Price */}
      <BudgetStore />

      {/* 8. New Arrivals Product Grid */}
      <section className="py-10 sm:py-14 bg-neutral-50/70 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 font-flipkart mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fresh in Store</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-flipkart">
                Latest New Arrivals
              </h2>
            </div>
            <Link
              href="/shop/collection/new-arrivals"
              className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-rose-600 transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="ml-1 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ProductGrid
            products={newArrivals.length > 0 ? newArrivals : allCardProducts.slice(0, 4)}
          />
        </div>
      </section>

      {/* 9. Direct WhatsApp Shopping Support Strip */}
      <CampaignBanner />
    </div>
  );
}
