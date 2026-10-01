"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, LayoutGrid, Heart, User } from "lucide-react";
import { useWishlist } from "@/providers/wishlist-provider";
import { useCart } from "@/providers/cart-provider";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Hide bottom nav on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHomeActive = pathname === "/";
  const isCategoriesActive =
    pathname === "/categories" || pathname.startsWith("/categories/");
  const isShopActive =
    pathname === "/shop" || pathname.startsWith("/shop/");
  const isWishlistActive = pathname === "/wishlist";
  const isAccountActive =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-rose-100 shadow-[0_-4px_20px_rgba(225,29,72,0.06)] pb-safe transition-all select-none"
    >
      <div className="max-w-md mx-auto px-2 h-15 flex items-center justify-between">
        {/* 1. Home */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90",
            isHomeActive ? "text-rose-600 font-semibold" : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <div className="relative">
            <Home
              className={cn(
                "w-5 h-5 transition-transform",
                isHomeActive ? "scale-110 stroke-[2.3]" : "stroke-[1.7]"
              )}
            />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </Link>

        {/* 2. Categories */}
        <Link
          href="/categories"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90",
            isCategoriesActive ? "text-rose-600 font-semibold" : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <div className="relative">
            <LayoutGrid
              className={cn(
                "w-5 h-5 transition-transform",
                isCategoriesActive ? "scale-110 stroke-[2.3]" : "stroke-[1.7]"
              )}
            />
            {isCategoriesActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Categories</span>
        </Link>

        {/* 3. Center Elevated "Shop" Button */}
        <Link
          href="/shop"
          className="flex flex-col items-center justify-center flex-1 -mt-5 group active:scale-95 transition-transform"
          aria-label="Shop Catalog"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 shadow-[0_4px_14px_rgba(225,29,72,0.4)] group-hover:shadow-[0_6px_20px_rgba(225,29,72,0.55)] transition-all flex items-center justify-center"
            )}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
          </div>
          <span
            className={cn(
              "text-[10px] font-bold tracking-tight mt-0.5 transition-colors",
              isShopActive ? "text-rose-600" : "text-neutral-800"
            )}
          >
            Shop
          </span>
        </Link>

        {/* 4. Wishlist with Badge */}
        <Link
          href="/wishlist"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 relative",
            isWishlistActive ? "text-rose-600 font-semibold" : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <div className="relative">
            <Heart
              className={cn(
                "w-5 h-5 transition-transform",
                isWishlistActive
                  ? "scale-110 stroke-[2.3] fill-rose-600 text-rose-600"
                  : "stroke-[1.7]"
              )}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-xs">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
            {isWishlistActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Wishlist</span>
        </Link>

        {/* 5. Account */}
        <Link
          href={isAuthenticated ? "/account" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90",
            isAccountActive ? "text-rose-600 font-semibold" : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <div className="relative">
            {isAuthenticated && user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Account"
                width={20}
                height={20}
                unoptimized
                className={cn(
                  "w-5 h-5 rounded-full object-cover ring-1.5",
                  isAccountActive ? "ring-rose-600" : "ring-neutral-300"
                )}
              />
            ) : (
              <User
                className={cn(
                  "w-5 h-5 transition-transform",
                  isAccountActive ? "scale-110 stroke-[2.3]" : "stroke-[1.7]"
                )}
              />
            )}
            {isAccountActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">
            {isAuthenticated ? "Account" : "Sign In"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
