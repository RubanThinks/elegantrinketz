"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, Sparkles } from "lucide-react";
import type { ProductCardData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getDiscountPercentage } from "@/config/constants";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/providers/wishlist-provider";

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  const {
    id,
    name,
    primaryImage,
    hoverImage,
    image,
    price,
    compareAtPrice,
    isNew,
    isBestSeller,
    isOutOfStock,
    href,
  } = product;

  const wishlisted = isInWishlist(id);

  // Resolve main resting image and desktop hover image
  const displayPrimaryImage = primaryImage || image;
  const displayHoverImage = hoverImage;

  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > price);
  const discountPercent =
    hasDiscount && compareAtPrice
      ? getDiscountPercentage(price, compareAtPrice)
      : 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 450);
    await toggleWishlist(id);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden bg-white rounded-2xl border border-rose-100/80 hover:border-rose-300 shadow-[0_2px_8px_rgba(225,29,72,0.04)] hover:shadow-[0_8px_20px_rgba(225,29,72,0.08)] hover:-translate-y-1 transition-all duration-300",
        isOutOfStock && "opacity-85",
        className
      )}
    >
      {/* Image Container with 3:4 portrait ratio & smooth zoom/crossfade */}
      <div className="relative w-full aspect-[3/4] bg-rose-50/50 overflow-hidden">
        <Link href={href} className="block w-full h-full relative" tabIndex={-1}>
          {/* Primary image */}
          <Image
            src={displayPrimaryImage}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover object-top transition-all duration-500 ease-out",
              isOutOfStock && "grayscale contrast-90",
              displayHoverImage && !isOutOfStock
                ? "md:group-hover:opacity-0 md:group-hover:scale-105"
                : "group-hover:scale-105"
            )}
          />

          {/* Desktop Hover Image Crossfade */}
          {displayHoverImage && !isOutOfStock && (
            <Image
              src={displayHoverImage}
              alt={`${name} alternative view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="hidden md:block object-cover object-top absolute inset-0 opacity-0 transition-all duration-500 ease-out md:group-hover:opacity-100 md:group-hover:scale-105"
            />
          )}
        </Link>

        {/* Badges Overlay (Top-Left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-neutral-900/80 text-white backdrop-blur-xs">
              Sold Out
            </span>
          ) : (
            <>
              {isNew && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                  New In
                </span>
              )}
              {isBestSeller && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Bestseller
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white flex items-center justify-center shadow-xs transition-all duration-200 hover:scale-110 active:scale-90 z-20 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-400",
            wishlisted && "bg-white text-rose-600 shadow-sm"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              wishlisted
                ? "fill-rose-600 text-rose-600"
                : "text-neutral-500 hover:text-rose-600",
              isHeartPopping && "animate-heart-pop"
            )}
          />
        </button>

        {/* Quick View Button (Desktop only on hover) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center z-10 pointer-events-none group-hover:pointer-events-auto">
          <Link
            href={href}
            className={cn(
              "w-full py-2 px-3 text-xs font-semibold rounded-xl tracking-wide text-center shadow-md transition-all flex items-center justify-center gap-1.5",
              isOutOfStock
                ? "bg-neutral-200 text-neutral-500 cursor-not-allowed pointer-events-none"
                : "bg-white/95 text-neutral-900 hover:bg-rose-600 hover:text-white backdrop-blur-xs active:scale-95"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? "Sold Out" : "View Style"}</span>
          </Link>
        </div>
      </div>

      {/* Product Details (Myntra / Purplle style pricing hierarchy) */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white space-y-1">
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-neutral-900 leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors">
            <Link href={href}>{name}</Link>
          </h3>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
          <span className="text-sm sm:text-base font-bold text-neutral-900">
            {formatPrice(price)}
          </span>
          {hasDiscount && compareAtPrice && (
            <>
              <span className="text-[11px] text-neutral-400 line-through">
                {formatPrice(compareAtPrice)}
              </span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
