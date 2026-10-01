import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export interface HeroProps {
  headline?: string;
  subheadline?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function Hero({
  headline = "Elegance in Every Dress",
  subheadline = "New Festive & Summer Drop",
  description = "Discover kurtis, 3-piece sets, gowns, and accessories curated for modern elegance.",
  ctaText = "Shop Collection",
  ctaHref = "/shop",
  secondaryCtaText = "Explore Categories",
  secondaryCtaHref = "/categories",
  imageUrl = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
  imageAlt = "Elegant Trinketz fashion collection",
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-900 text-white min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[center_35%] scale-100 transition-transform duration-1000 ease-out"
        />
        {/* Soft Pink-Tinted Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-900/60 to-rose-950/30 sm:from-neutral-950/90 sm:via-neutral-900/55" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
        <div className="max-w-xl sm:max-w-2xl space-y-5">
          {/* Tagline badge */}
          {subheadline && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-pink-200 text-xs font-semibold tracking-wide backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-pink-300 animate-pulse" />
              <span>{subheadline}</span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif italic font-bold tracking-tight text-white leading-[1.12]">
            {headline}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-neutral-200 font-light leading-relaxed max-w-lg">
            {description}
          </p>

          {/* Dual Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-rose-600/35 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={secondaryCtaHref}
              className="inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-full bg-white/95 hover:bg-white text-neutral-900 font-semibold text-xs sm:text-sm tracking-wide backdrop-blur-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
            >
              <span>{secondaryCtaText}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
