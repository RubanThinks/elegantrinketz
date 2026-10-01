"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
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
        "group relative flex flex-col overflow-hidden bg-white border border-[#e8e0d8] hover:border-[#D4AF37]/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300",
        isOutOfStock && "opacity-85",
        className
      )}
    >
      {/* Image Container with 3:4 portrait ratio & smooth zoom/crossfade */}
      <div className="relative w-full aspect-[3/4] bg-[#f8f4f0] overflow-hidden">
        <Link href={href} className="block w-full h-full relative" tabIndex={-1}>
          {/* Primary image (resting state) */}
          <Image
            src={displayPrimaryImage}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover object-top transition-all duration-500 ease-out",
              isOutOfStock && "grayscale contrast-90",
              // On desktop hover, scale slightly and fade out if hoverImage is present
              displayHoverImage && !isOutOfStock
                ? "md:group-hover:opacity-0 md:group-hover:scale-105"
                : "group-hover:scale-105"
            )}
          />

          {/* Desktop Hover Image Crossfade (only active on desktop devices with hover support) */}
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
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <Badge variant="outOfStock" className="rounded-sm shadow-xs">
              Sold Out
            </Badge>
          ) : (
            <>
              {isNew && (
                <Badge variant="default" className="rounded-sm shadow-xs bg-[#111] text-white border-none">
                  New
                </Badge>
              )}
              {isBestSeller && (
                <Badge variant="secondary" className="rounded-sm shadow-xs bg-[#D4AF37] text-[#111] border-none">
                  ★ Bestseller
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="sale" className="rounded-sm shadow-xs bg-[#E9A0B8] text-white border-none">
                  -{discountPercent}%
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button (Top-Right) with animated heart pop */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2.5 right-2.5 w-8.5 h-8.5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 z-20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
            wishlisted && "bg-white text-[#E9A0B8] shadow-md"
          )}
        >
          <Heart
            className={cn(
              "w-4.5 h-4.5 transition-colors duration-200",
              wishlisted
                ? "fill-[#E9A0B8] text-[#E9A0B8]"
                : "text-[#666] hover:text-[#1a1a1a]",
              isHeartPopping && "animate-heart-pop"
            )}
          />
        </button>

        {/* Quick Action Overlay (Bottom pill) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex items-center justify-center z-10 pointer-events-none group-hover:pointer-events-auto">
          <Link
            href={href}
            className={cn(
              "w-full py-2.5 px-4 text-xs font-semibold tracking-wide text-center shadow-md transition-all flex items-center justify-center gap-1.5 uppercase",
              isOutOfStock
                ? "bg-[#e8e0d8] text-[#999] cursor-not-allowed pointer-events-none"
                : "bg-[#111]/95 hover:bg-[#000] text-white backdrop-blur-xs hover:shadow-lg active:scale-[0.98]"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? "Sold Out" : "Quick View"}</span>
          </Link>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-medium text-[#1a1a1a] leading-snug line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            <Link href={href}>{name}</Link>
          </h3>

          {/* Pricing with clear visual hierarchy */}
          <div className="flex items-center space-x-2 pt-0.5">
            <span className="text-sm sm:text-base font-semibold text-[#1a1a1a]">
              {formatPrice(price)}
            </span>
            {hasDiscount && compareAtPrice && (
              <span className="text-xs text-[#b8a99c] line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
