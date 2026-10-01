import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  subheadline,
  description = "Discover styles designed to make every occasion feel special.",
  ctaText = "Shop Collection",
  ctaHref = "/shop",
  secondaryCtaText = "Explore Categories",
  secondaryCtaHref = "/categories",
  imageUrl = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
  imageAlt = "Elegant women's fashion collection",
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#111111] text-white min-h-[560px] sm:min-h-[620px] lg:min-h-[700px] flex items-center">
      {/* Background Image with optimized presentation */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[center_30%] scale-100 transition-transform duration-1000 ease-out"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/90 via-[#111111]/60 to-[#111111]/25 sm:from-[#111111]/95 sm:via-[#111111]/65" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-xl sm:max-w-2xl space-y-6">
          {/* Tagline badge */}
          {subheadline && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E6C76A] text-xs font-medium tracking-wide">
              <span>{subheadline}</span>
            </div>
          )}

          {/* Brand logo badge — circular placeholder */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-sm shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-white/95 p-[2px] flex items-center justify-center">
                <Image
                  src={siteConfig.logo}
                  alt={siteConfig.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <div className="h-7 w-px bg-[#D4AF37]/50" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E6C76A] font-medium">
              {siteConfig.name}
            </span>
          </div>

          {/* Bold, Elegant Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.15]">
            {headline}
          </h1>

          {/* Supporting description */}
          <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed max-w-lg">
            {description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <Link href={ctaHref}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C9A227] text-[#111] font-semibold shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 hover:scale-[1.02] active:scale-[0.98] transition-all px-7 group rounded-none tracking-wide uppercase text-xs"
              >
                <span>{ctaText}</span>
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            {secondaryCtaText && (
              <Link href={secondaryCtaHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white/30 bg-white/5 hover:bg-white/15 hover:border-white/60 px-7 rounded-none font-medium tracking-wide uppercase text-xs"
                >
                  {secondaryCtaText}
                </Button>
              </Link>
            )}
          </div>

          {/* Gold decorative line */}
          <div className="pt-6">
            <div className="w-16 h-px bg-gradient-to-r from-[#D4AF37] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
