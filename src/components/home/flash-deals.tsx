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
    hours: 8,
    minutes: 0,
    seconds: 0,
    isExpired: false,
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

  // Compute live countdown to admin-configured expiration (e.g. 12:00 PM or midnight)
  useEffect(() => {
    const calculateRemaining = () => {
      const expiry = new Date(dealConfig.expiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
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

  // Resolve products: filter by admin-selected productIds if present, or fallback to top products
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    if (dealConfig.productIds && dealConfig.productIds.length > 0) {
      const selected = products.filter((p) =>
        dealConfig.productIds.includes(p.id)
      );
      if (selected.length > 0) {
        // If selected is less than 4, pad with other products
        if (selected.length < 4) {
          const remaining = products.filter(
            (p) => !dealConfig.productIds.includes(p.id)
          );
          return [...selected, ...remaining].slice(0, 4);
        }
        return selected.slice(0, 4);
      }
    }

    return products.slice(0, 4);
  }, [products, dealConfig.productIds]);

  if (!dealConfig.enabled || displayProducts.length === 0) return null;

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
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
              <Clock className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="text-neutral-500 font-medium">
                {timeLeft.isExpired ? "Status:" : "Ends in:"}
              </span>
              <span className="font-mono font-bold text-neutral-950">
                {timeLeft.isExpired ? (
                  <span className="text-red-600">Refreshes Soon</span>
                ) : (
                  `${pad(timeLeft.hours)}h : ${pad(timeLeft.minutes)}m : ${pad(timeLeft.seconds)}s`
                )}
              </span>
            </div>

            <Link
              href="/shop?sort=discount_desc"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-red-600 transition-colors"
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
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            <span>Explore All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
