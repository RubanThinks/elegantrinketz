"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Grid3X3, Heart, User, Sparkles } from "lucide-react";
import { useWishlist } from "@/providers/wishlist-provider";
import { useCart } from "@/providers/cart-provider";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  // Hide bottom nav on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHomeActive = pathname === "/";
  const isShopActive = pathname === "/shop" || pathname.startsWith("/shop/");
  const isCategoriesActive = pathname === "/categories" || pathname.startsWith("/categories/");
  const isWishlistActive = pathname === "/wishlist";
  const isAccountActive =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#e8e0d8] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-between">
        {/* 1. Home Button */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors select-none",
            isHomeActive ? "text-[#D4AF37]" : "text-[#666] hover:text-[#1a1a1a]"
          )}
        >
          <div className="relative">
            <Home className={cn("w-5 h-5 transition-transform", isHomeActive && "scale-110 stroke-[2.2]")} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
        </Link>

        {/* 2. Categories Button */}
        <Link
          href="/categories"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors select-none",
            isCategoriesActive ? "text-[#D4AF37]" : "text-[#666] hover:text-[#1a1a1a]"
          )}
        >
          <div className="relative">
            <Grid3X3 className={cn("w-5 h-5 transition-transform", isCategoriesActive && "scale-110 stroke-[2.2]")} />
            {isCategoriesActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Categories</span>
        </Link>

        {/* 3. Center Elevated "Shop Now" Action Button */}
        <Link
          href="/shop"
          className="flex flex-col items-center justify-center flex-1 -mt-4 group select-none"
          aria-label="Shop Now"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-[0_4px_14px_rgba(212,175,55,0.4)] group-hover:shadow-[0_6px_20px_rgba(212,175,55,0.6)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center"
            )}
          >
            <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5 text-[#F6E27A]" />
            </div>
          </div>
          <span
            className={cn(
              "text-[10px] font-bold tracking-tight mt-0.5 transition-colors",
              isShopActive ? "text-[#D4AF37]" : "text-[#1a1a1a]"
            )}
          >
            Shop Now
          </span>
        </Link>

        {/* 4. Wishlist Button */}
        <Link
          href="/wishlist"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors select-none relative",
            isWishlistActive ? "text-[#D4AF37]" : "text-[#666] hover:text-[#1a1a1a]"
          )}
        >
          <div className="relative">
            <Heart className={cn("w-5 h-5 transition-transform", isWishlistActive && "scale-110 stroke-[2.2] fill-[#D4AF37]")} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
            {isWishlistActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Wishlist</span>
        </Link>

        {/* 5. Account Button */}
        <Link
          href={isAuthenticated ? "/account" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors select-none",
            isAccountActive ? "text-[#D4AF37]" : "text-[#666] hover:text-[#1a1a1a]"
          )}
        >
          <div className="relative">
            <User className={cn("w-5 h-5 transition-transform", isAccountActive && "scale-110 stroke-[2.2]")} />
            {isAccountActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Account</span>
        </Link>
      </div>
    </nav>
  );
}
