"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CuratedSectionSettings } from "@/types";
import { DEFAULT_CURATED_SECTION } from "@/services/storefront";

interface CategoryGridProps {
  initialSettings?: CuratedSectionSettings;
}

export function CategoryGrid({ initialSettings }: CategoryGridProps) {
  const settings = initialSettings || DEFAULT_CURATED_SECTION;

  if (!settings.enabled) return null;

  const activeTiles = (settings.tiles || [])
    .filter((t) => t.isActive !== false)
    .sort((a, b) => a.order - b.order);

  if (activeTiles.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 font-sans">
              {settings.eyebrow || "Curated Boutique"}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-serif mt-0.5">
              {settings.title || "Shop by Outfit Style"}
            </h2>
          </div>
          {settings.buttonText && settings.buttonHref && (
            <Link
              href={settings.buttonHref}
              className="group inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-xs font-bold uppercase tracking-wider text-[#881337] transition-all shadow-xs"
            >
              <span>{settings.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Visual Category / Curated Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {activeTiles.map((tile) => (
            <Link
              key={tile.id || tile.title}
              href={tile.href || "/shop"}
              className="group relative bg-white border border-rose-200/80 hover:border-[#881337] hover:ring-1 hover:ring-[#881337]/30 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-rose-50/40">
                {tile.imageUrl ? (
                  <Image
                    src={tile.imageUrl}
                    alt={tile.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-rose-50 text-neutral-400 text-xs font-bold">
                    No Image
                  </div>
                )}
                {tile.badge && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#881337] text-white uppercase tracking-wider shadow-xs">
                    {tile.badge}
                  </span>
                )}
              </div>

              {/* Text Meta (Fully Admin-Configurable Title, Tagline & Price Offer) */}
              <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-white">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate font-flipkart group-hover:text-[#881337] transition-colors">
                    {tile.title}
                  </h3>
                  {tile.tagline && (
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                      {tile.tagline}
                    </p>
                  )}
                </div>
                {tile.priceText && (
                  <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#388e3c] font-flipkart">
                      {tile.priceText}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900">
                      →
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
