import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function EditorialBanner() {
  return (
    <section className="w-full bg-[#fff9f5] py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Visual Composition: Layered Asymmetric Images */}
          <div className="lg:col-span-7 relative">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
              {/* Primary Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                  alt="Elegant women's fashion styling"
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Offset Secondary Image */}
              <div className="relative aspect-[3/4] overflow-hidden translate-y-6 sm:translate-y-8">
                <Image
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
                  alt="Detailed fashion styling and embroidery"
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Gold Accent Badge */}
              <div className="absolute -bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6 z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-xl border border-[#e8e0d8] flex items-center gap-3 rounded-xl">
                <div className="relative w-9 h-9 rounded-full p-[1px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-xs shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1.5px] flex items-center justify-center">
                    <Image
                      src={siteConfig.logo}
                      alt=""
                      width={36}
                      height={36}
                      className="w-full h-full object-contain rounded-full"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1a1a1a]">{siteConfig.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-medium">{siteConfig.tagline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Story Text */}
          <div className="lg:col-span-5 space-y-6 pt-10 lg:pt-0 lg:pl-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#111] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
              <span>Find Your Signature Style</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#1a1a1a] tracking-tight leading-snug">
              Style Made for Every Woman
            </h2>

            <p className="text-sm sm:text-base text-[#666] leading-relaxed font-light">
              {siteConfig.name} brings together contemporary women&apos;s fashion with 
              elegant silhouettes, expressive colors, and styles designed for everyday 
              moments and special occasions.
            </p>

            <div className="w-12 h-px bg-[#D4AF37]" />

            <div className="pt-2 flex items-center gap-4">
              <Link href="/about">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-[#111] hover:bg-[#000] text-white rounded-none px-6 group font-medium uppercase text-xs tracking-wider"
                >
                  <span>Our Story</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link
                href="/shop"
                className="text-xs font-semibold text-[#D4AF37] hover:text-[#C9A227] underline underline-offset-4"
              >
                Browse All Pieces
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
