"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, ArrowRight } from "lucide-react";
import type { ProductCardData } from "@/types";
import { ProductCard } from "@/components/product/product-card";

interface FlashDealsProps {
  products: ProductCardData[];
}

export function FlashDeals({ products }: FlashDealsProps) {
  // 8-hour countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 48, seconds: 24 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  const displayProducts = products.slice(0, 4);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Deal Header with Ticker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-neutral-200 mb-6 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#cc0c39] text-white text-xs font-black uppercase tracking-wider font-amazon">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Deal of the Day</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight font-flipkart">
              Top Steals on Kurtis &amp; Sets
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Countdown Timer */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
              <Clock className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="text-neutral-500 font-medium">Ends in:</span>
              <span className="font-mono font-bold text-neutral-950">
                {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
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
