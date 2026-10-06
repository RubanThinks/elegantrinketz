"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingCart, User, Menu } from "lucide-react";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/config/navigation";
import { MobileDrawer } from "@/components/navigation/mobile-drawer";
import { HeaderSearch } from "@/components/search/header-search";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/providers/wishlist-provider";
import { useCart } from "@/providers/cart-provider";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { cn } from "@/lib/utils";

export function Header() {
  const { isAuthenticated, user, profile } = useAuth();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I have an inquiry about your collections.`
  )}`;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200 bg-white border-b",
          isScrolled
            ? "border-neutral-200 shadow-sm py-2"
            : "border-neutral-200/80 py-2.5 sm:py-3"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Top Row */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Mobile Hamburger (left on mobile) */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 -ml-2 text-neutral-800 hover:text-neutral-900 focus:outline-none rounded-lg active:scale-95 transition-transform"
              >
                <Menu className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Brand Logo & Clean E-Commerce Storefront Name */}
            <div className="flex items-center">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-95"
                aria-label={`${siteConfig.name} — Home`}
              >
                {/* Logo Solid Container */}
                <div
                  className={cn(
                    "relative rounded-full border border-neutral-200 bg-white p-[1px] shrink-0 transition-all",
                    isScrolled ? "w-8 h-8 sm:w-9 sm:h-9" : "w-9 h-9 sm:w-10 sm:h-10"
                  )}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src={siteConfig.logo}
                      alt={siteConfig.name}
                      width={40}
                      height={40}
                      priority
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>

                {/* Brand Wordmark & Department Tagline */}
                <div className="flex flex-col text-left">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-neutral-950 font-flipkart leading-tight">
                    {siteConfig.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-rose-600 font-bold leading-tight hidden xs:block">
                    Women&apos;s Fashion Store
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6">
              {mainNavigation.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                const isDeal = item.label.includes("Deals");

                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "text-xs uppercase tracking-wider font-bold py-1.5 transition-colors relative flex items-center gap-1",
                        isDeal
                          ? "text-red-600 font-extrabold"
                          : isActive
                          ? "text-neutral-950"
                          : "text-neutral-700 hover:text-neutral-950"
                      )}
                    >
                      {item.label}
                      {isDeal && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-extrabold tracking-normal">
                          HOT
                        </span>
                      )}
                      <span
                        className={cn(
                          "absolute left-0 -bottom-0.5 w-full h-[2px] bg-neutral-950 transition-transform duration-200 origin-left",
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </Link>

                    {/* Desktop Dropdown Menu if children present */}
                    {item.children && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 z-50">
                        <div className="bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 min-w-[200px]">
                          {item.children.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="block px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Header Action Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* WhatsApp CTA — desktop only */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Chat</span>
              </a>

              {/* Desktop Header Search Bar (Amazon & Flipkart style) */}
              <div className="hidden lg:block w-56 xl:w-72">
                <HeaderSearch placeholder="Search kurtis, 3-piece sets, pants..." />
              </div>

              {/* Account (desktop) */}
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                aria-label={isAuthenticated ? "My Account" : "Sign In"}
                className="hidden sm:inline-flex p-2 text-neutral-700 hover:text-rose-600 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-400 rounded-full items-center justify-center"
              >
                {isAuthenticated && user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={profile?.displayName || "Account"}
                    width={22}
                    height={22}
                    unoptimized
                    className="w-5 h-5 rounded-full object-cover ring-1.5 ring-rose-400"
                  />
                ) : (
                  <User className={cn("w-5 h-5 stroke-[1.8]", isAuthenticated && "text-rose-600")} />
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-2 text-neutral-700 hover:text-rose-600 transition-colors relative focus:outline-none focus:ring-1 focus:ring-rose-400 rounded-full active:scale-90"
              >
                <Heart className="w-5 h-5 stroke-[1.8]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs animate-scale-in">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
                <span className="sr-only">Wishlist ({wishlistCount})</span>
              </Link>

              {/* Shopping Cart — using distinct ShoppingCart icon */}
              <Link
                href="/cart"
                aria-label={`Shopping Cart (${itemCount} items)`}
                className="p-2 text-neutral-700 hover:text-rose-600 transition-colors relative focus:outline-none focus:ring-1 focus:ring-rose-400 rounded-full active:scale-90"
              >
                <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs animate-scale-in">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart ({itemCount})</span>
              </Link>
            </div>
          </div>

          {/* Mobile Live Search Bar (Amazon & Flipkart style with real-time auto-suggestions) */}
          <div className="mt-2.5 lg:hidden">
            <HeaderSearch isMobile placeholder="Search kurtis, frocks, gowns, trinketz..." />
          </div>
        </div>
      </header>

      {/* Simplified E-Commerce Mobile App Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
