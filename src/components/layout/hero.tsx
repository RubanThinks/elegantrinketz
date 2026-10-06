"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { HeroSlide } from "@/types";
import { getHeroSlides, DEFAULT_HERO_SLIDES } from "@/services/storefront";

interface HeroProps {
  initialSlides?: HeroSlide[];
}

export function Hero({ initialSlides }: HeroProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_HERO_SLIDES
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load latest admin-configured slides
  useEffect(() => {
    let active = true;
    getHeroSlides().then((res) => {
      if (active && res && res.length > 0) {
        const activeOnly = res.filter((s) => s.isActive);
        if (activeOnly.length > 0) {
          setSlides(activeOnly);
        }
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const validIndex = currentSlide >= slides.length ? 0 : currentSlide;
  const slide = slides[validIndex];

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
          {slide.badge && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider text-white shadow-xs font-amazon"
              style={{ backgroundColor: slide.badgeColor || "#cc0c39" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.badge}</span>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-flipkart leading-[1.1]">
            {slide.title}
            {slide.highlight && (
              <span className="block text-[#ff9f00] mt-1">
                {slide.highlight}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          {slide.subtitle && (
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-md">
              {slide.subtitle}
            </p>
          )}

          {/* Solid Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {slide.ctaText && slide.ctaHref && (
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#ff9f00] hover:bg-[#f39700] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm active:scale-95 transition-all font-flipkart cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-neutral-950 stroke-[3]" />
              </Link>
            )}

            {slide.secondaryCtaText && slide.secondaryCtaHref && (
              <Link
                href={slide.secondaryCtaHref}
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs sm:text-sm uppercase tracking-wider active:scale-95 transition-all font-flipkart cursor-pointer"
              >
                <span>{slide.secondaryCtaText}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
            }
            aria-label="Previous Offer Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-neutral-950/60 hover:bg-neutral-950 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            aria-label="Next Offer Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-neutral-950/60 hover:bg-neutral-950 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Pagination Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                validIndex === idx ? "w-6 bg-[#ff9f00]" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
