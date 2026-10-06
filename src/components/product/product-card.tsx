"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, Sparkles } from "lucide-react";
import type { ProductCardData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getDiscountPercentage } from "@/config/constants";
import { siteConfig } from "@/config/site";
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
        "group relative flex flex-col overflow-hidden bg-white rounded-xl border border-neutral-200 hover:border-neutral-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        isOutOfStock && "opacity-85",
        className
      )}
    >
      {/* Image Container with 3:4 portrait ratio & smooth zoom/crossfade */}
      <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
        <Link href={href} className="block w-full h-full relative" tabIndex={-1}>
          {/* Primary image */}
          <Image
            src={displayPrimaryImage}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover object-top transition-transform duration-300 ease-out",
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
              className="hidden md:block object-cover object-top absolute inset-0 opacity-0 transition-all duration-300 ease-out md:group-hover:opacity-100 md:group-hover:scale-105"
            />
          )}
        </Link>

        {/* Badges Overlay (Top-Left) — Solid E-Commerce Deal Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white font-flipkart uppercase tracking-wider">
              Sold Out
            </span>
          ) : (
            <>
              {hasDiscount && discountPercent >= 15 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#cc0c39] text-white shadow-2xs uppercase tracking-wider font-amazon">
                  Limited Deal
                </span>
              )}
              {isBestSeller && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff9f00] text-neutral-950 uppercase tracking-wider font-flipkart">
                  ★ Best Seller
                </span>
              )}
              {isNew && !isBestSeller && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2874f0] text-white uppercase tracking-wider font-flipkart">
                  New Arrival
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
            "absolute top-2 right-2 w-8 h-8 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 flex items-center justify-center shadow-xs transition-transform active:scale-90 z-20 cursor-pointer focus:outline-none",
            wishlisted && "text-rose-600 border-rose-300 bg-rose-50"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              wishlisted
                ? "fill-rose-600 text-rose-600"
                : "text-neutral-500 hover:text-neutral-900",
              isHeartPopping && "animate-heart-pop"
            )}
          />
        </button>

        {/* Quick View Button (Desktop only on hover) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center z-10 pointer-events-none group-hover:pointer-events-auto">
          <Link
            href={href}
            className={cn(
              "w-full py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg text-center shadow-sm transition-all flex items-center justify-center gap-1.5 font-flipkart",
              isOutOfStock
                ? "bg-neutral-200 text-neutral-500 cursor-not-allowed pointer-events-none"
                : "bg-white text-neutral-900 hover:bg-neutral-950 hover:text-white border border-neutral-300 active:scale-95"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? "Sold Out" : "View Product"}</span>
          </Link>
        </div>
      </div>

      {/* Product Details (Flipkart Exact Typography & Psychography Layout) */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white space-y-1.5 font-flipkart">
        <div className="space-y-0.5">
          {/* Brand Title Position */}
          <p className="flipkart-brand-title">
            {siteConfig.name}
          </p>

          {/* Product Title Position */}
          <h3 className="flipkart-product-title line-clamp-1 group-hover:text-rose-600 transition-colors">
            <Link href={href} title={name}>
              {name}
            </Link>
          </h3>
        </div>

        {/* Exact Flipkart Pricing Hierarchy: [Price] [MRP Strikethrough] [Discount % off] */}
        <div className="pt-1 border-t border-neutral-100/80">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="flipkart-price-main">
              {formatPrice(price)}
            </span>
            {hasDiscount && compareAtPrice && (
              <>
                <span className="flipkart-mrp">
                  {formatPrice(compareAtPrice)}
                </span>
                <span className="flipkart-discount-green">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          {/* Free Delivery */}
          <div className="flex items-center text-[11px] pt-1">
            <span className="text-[#388e3c] font-medium">
              Free delivery
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
