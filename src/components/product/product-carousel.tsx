"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductCardData } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: ProductCardData[];
  className?: string;
}

export function ProductCarousel({ products, className }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className={cn("relative group/carousel", className)}>
      {/* Desktop Prev Button */}
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
        className={cn(
          "hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 text-neutral-800 shadow-md border border-neutral-100 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white disabled:opacity-0 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
          canScrollLeft ? "opacity-90 hover:opacity-100" : "opacity-0"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Desktop Next Button */}
      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="Scroll right"
        className={cn(
          "hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 text-neutral-800 shadow-md border border-neutral-100 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white disabled:opacity-0 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
          canScrollRight ? "opacity-90 hover:opacity-100" : "opacity-0"
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scroll Track with Snap & Partial Peek */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 snap-start w-[240px] sm:w-[260px] md:w-[270px] lg:w-[280px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
