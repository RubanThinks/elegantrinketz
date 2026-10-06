"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Touch & Mouse Drag Gestures State
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  if (!images || images.length === 0) return null;

  const activeImage = images[activeIndex] || images[0];

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch Swipe Handlers (Mobile / Tablets)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartXRef.current;
    const diffY = touchEndY - touchStartYRef.current;

    // Detect intentional horizontal swipe (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swiped Left -> Next Image
        goNext();
      } else {
        // Swiped Right -> Previous Image
        goPrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Mouse Drag Handlers (Desktop Mouse Swiping)
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || mouseStartXRef.current === null) return;
    const diffX = e.clientX - mouseStartXRef.current;

    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    isDraggingRef.current = false;
    mouseStartXRef.current = null;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    mouseStartXRef.current = null;
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3">
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar">
          {images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative shrink-0 w-16 h-20 sm:w-18 sm:h-22 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none cursor-pointer",
                idx === activeIndex
                  ? "border-neutral-900 shadow-md ring-2 ring-neutral-900/10"
                  : "border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400"
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={url}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image viewer with full Touch Swipe & Mouse Drag capabilities */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden group select-none cursor-grab active:cursor-grabbing"
      >
        <Image
          src={activeImage}
          alt={`${productName} view ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 45vw"
          className="object-cover transition-opacity duration-300 pointer-events-none"
        />

        {/* Counter Pill (Flipkart / Amazon mobile style) */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-neutral-900/75 backdrop-blur-xs text-white text-[10px] font-bold z-20 pointer-events-none font-mono">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation arrows (Visible on hover and on touch devices) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-20 cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-20 cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Swipe Hint / Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200 cursor-pointer",
                  idx === activeIndex
                    ? "bg-neutral-900 w-5 shadow-xs"
                    : "bg-neutral-400/70 hover:bg-neutral-600 w-1.5"
                )}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
