"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Zap, Clock, ArrowRight } from "lucide-react";
import type { ProductCardData, DealOfTheDaySettings } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { getDealOfTheDaySettings, DEFAULT_DEAL_OF_THE_DAY } from "@/services/storefront";

interface FlashDealsProps {
  products: ProductCardData[];
  initialSettings?: DealOfTheDaySettings;
}

export function FlashDeals({ products, initialSettings }: FlashDealsProps) {
  const [dealConfig, setDealConfig] = useState<DealOfTheDaySettings>(
    initialSettings || DEFAULT_DEAL_OF_THE_DAY
  );

  // Time remaining state
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: !initialSettings?.expiresAt || new Date(initialSettings.expiresAt).getTime() <= Date.now(),
  });

  // Load latest admin configuration if not supplied or on mount
  useEffect(() => {
    let active = true;
    getDealOfTheDaySettings().then((cfg) => {
      if (active && cfg) {
        setDealConfig(cfg);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Compute live countdown to admin-configured expiration
  useEffect(() => {
    if (!dealConfig.expiresAt) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const calculateRemaining = () => {
      const expiry = new Date(dealConfig.expiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (isNaN(expiry) || diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [dealConfig.expiresAt]);

  // Resolve products: strictly display the products assigned by the admin to this deal
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0 || !dealConfig.enabled) return [];

    if (dealConfig.deals && dealConfig.deals.length > 0) {
      const dealIds = dealConfig.deals.map((d) => d.productId);
      return products.filter((p) => dealIds.includes(p.id));
    }

    if (dealConfig.productIds && dealConfig.productIds.length > 0) {
      return products.filter((p) => dealConfig.productIds.includes(p.id));
    }

    return [];
  }, [products, dealConfig.deals, dealConfig.productIds, dealConfig.enabled]);

  // If deal is disabled, expired, or has no assigned products, render absolutely nothing
  if (!dealConfig.enabled || timeLeft.isExpired || displayProducts.length === 0) {
    return null;
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Deal Header with Ticker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-neutral-200 mb-6 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#cc0c39] text-white text-xs font-black uppercase tracking-wider font-amazon">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>{dealConfig.badgeText || "Deal of the Day"}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight font-flipkart">
              {dealConfig.headline || "Top Steals on Kurtis & Sets"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Countdown Timer */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-950 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-[#881337] animate-pulse" />
              <span className="text-rose-700 font-medium">
                {timeLeft.isExpired ? "Status:" : "Ends in:"}
              </span>
              <span className="font-mono font-bold text-[#881337]">
                {timeLeft.isExpired ? (
                  <span className="text-rose-600">Refreshes Soon</span>
                ) : (
                  `${pad(timeLeft.hours)}h : ${pad(timeLeft.minutes)}m : ${pad(timeLeft.seconds)}s`
                )}
              </span>
            </div>

            <Link
              href="/shop?sort=discount_desc"
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold uppercase tracking-wider text-[#881337] transition-all shadow-xs"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4-Item Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All button */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/shop?sort=discount_desc"
            className="inline-flex items-center justify-center gap-1.5 w-full py-3 bg-gradient-to-r from-[#881337] to-[#4c0519] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md active:scale-98"
          >
            <span>Explore All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
