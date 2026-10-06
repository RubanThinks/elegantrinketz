"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface PromoSlide {
  badge: string;
  badgeColor: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  imageUrl: string;
}

const HERO_SLIDES: PromoSlide[] = [
  {
    badge: "FESTIVE SALE · FLAT 40% OFF",
    badgeColor: "bg-[#cc0c39]",
    title: "Side Cut & Umbrella",
    highlight: "Kurtis from ₹499",
    subtitle: "Premium cotton and rayon fabrics tailored for supreme comfort and vibrant style.",
    ctaText: "Shop Kurtis",
    ctaHref: "/shop/side-cut-kurtis",
    secondaryCtaText: "View Umbrella",
    secondaryCtaHref: "/shop/umbrella-kurtis",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
  },
  {
    badge: "NEW FESTIVE ARRIVALS",
    badgeColor: "bg-[#2874f0]",
    title: "Designer 3-Piece Sets",
    highlight: "Under ₹999",
    subtitle: "Complete Kurti, Straight Pant & Chiffon Dupatta sets ready for every special occasion.",
    ctaText: "Shop 3-Piece Sets",
    ctaHref: "/shop/three-piece-sets",
    secondaryCtaText: "All Festive",
    secondaryCtaHref: "/shop/ethnic-wear",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85",
  },
  {
    badge: "ESSENTIAL BOTTOMWEAR",
    badgeColor: "bg-emerald-600",
    title: "Straight Pants & Shimmer",
    highlight: "Leggings from ₹299",
    subtitle: "Ultra-stretch, non-fade fabrics engineered for all-day comfort and perfect drape.",
    ctaText: "Shop Bottomwear",
    ctaHref: "/shop/straight-pants",
    secondaryCtaText: "Shimmer Leggings",
    secondaryCtaHref: "/shop/shimmer-leggings",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 text-white min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
      {/* Background Banner with Dark High-Contrast Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src={slide.imageUrl}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[center_35%] transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/70 to-neutral-950/30 sm:from-neutral-950/95 sm:via-neutral-950/60" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="max-w-xl sm:max-w-2xl space-y-4">
          {/* Solid Offer Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider text-white shadow-xs font-amazon" style={{ backgroundColor: slide.badgeColor === "bg-[#cc0c39]" ? "#cc0c39" : slide.badgeColor === "bg-[#2874f0]" ? "#2874f0" : "#059669" }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-flipkart leading-[1.1]">
            {slide.title}
            <span className="block text-[#ff9f00] mt-1">
              {slide.highlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-md">
            {slide.subtitle}
          </p>

          {/* Solid Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#ff9f00] hover:bg-[#f39700] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm active:scale-95 transition-all font-flipkart cursor-pointer"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-neutral-950 stroke-[3]" />
            </Link>

            <Link
              href={slide.secondaryCtaHref}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs sm:text-sm uppercase tracking-wider active:scale-95 transition-all font-flipkart cursor-pointer"
            >
              <span>{slide.secondaryCtaText}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        type="button"
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
        }
        aria-label="Previous Offer Slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-neutral-950/60 hover:bg-neutral-950 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer hidden sm:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
        aria-label="Next Offer Slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-neutral-950/60 hover:bg-neutral-950 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer hidden sm:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? "w-6 bg-[#ff9f00]" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
