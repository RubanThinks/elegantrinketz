import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export function EditorialBanner() {
  return (
    <section className="w-full bg-gradient-to-b from-white via-rose-50/30 to-white py-12 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Visual Composition: Layered Rounded Images */}
          <div className="lg:col-span-7 relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
              {/* Primary Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md border border-rose-100">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                  alt="Elegant women's fashion styling"
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Offset Secondary Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md border border-rose-100 translate-y-4 sm:translate-y-8">
                <Image
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
                  alt="Detailed fashion styling and embroidery"
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Brand Floating Halo Badge */}
              <div className="absolute -bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6 z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-lg border border-rose-100 flex items-center gap-3 rounded-2xl">
                <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-rose-500 to-pink-500 shadow-xs shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1px] flex items-center justify-center">
                    <Image
                      src={siteConfig.logo}
                      alt=""
                      width={32}
                      height={32}
                      className="w-full h-full object-contain rounded-full"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-serif italic font-bold text-neutral-900">{siteConfig.name}</p>
                  <p className="text-[9px] uppercase tracking-wider text-rose-500 font-medium">{siteConfig.tagline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Story Text */}
          <div className="lg:col-span-5 space-y-5 pt-8 lg:pt-0 lg:pl-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Find Your Signature Style</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif italic font-bold text-neutral-900 tracking-tight leading-snug">
              Fashion Curated for Modern Grace
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
              {siteConfig.name} brings together contemporary women&apos;s fashion with 
              elegant silhouettes, expressive colors, and styles designed for everyday 
              moments and festive celebrations.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-600/25 transition-all"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/about"
                className="text-xs font-semibold text-neutral-700 hover:text-rose-600 transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
