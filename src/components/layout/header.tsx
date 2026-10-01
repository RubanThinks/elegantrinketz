"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, User, Menu } from "lucide-react";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/config/navigation";
import { MobileDrawer } from "@/components/navigation/mobile-drawer";
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
          "sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b",
          isScrolled
            ? "border-rose-100 shadow-[0_4px_16px_rgba(225,29,72,0.05)] py-2"
            : "border-rose-100/60 py-2.5 sm:py-3.5"
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
                className="p-2 -ml-2 text-neutral-800 hover:text-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-400 rounded-lg active:scale-95 transition-transform"
              >
                <Menu className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Brand Logo & Stylish High-Fashion Name */}
            <div className="flex items-center">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-95"
                aria-label={`${siteConfig.name} — Home`}
              >
                {/* Logo Halo */}
                <div
                  className={cn(
                    "relative rounded-full p-[1.5px] bg-gradient-to-tr from-rose-400 via-pink-300 to-rose-500 shadow-xs group-hover:shadow-md transition-all duration-300 shrink-0",
                    isScrolled ? "w-8 h-8 sm:w-10 sm:h-10" : "w-9 h-9 sm:w-11 sm:h-11"
                  )}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-[1px]">
                    <Image
                      src={siteConfig.logo}
                      alt={siteConfig.name}
                      width={44}
                      height={44}
                      priority
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>

                {/* Stylish Brand Wordmark & Tagline */}
                <div className="flex flex-col text-left">
                  <span className="font-serif italic font-bold text-base sm:text-lg tracking-wide text-neutral-900 group-hover:text-rose-600 transition-colors">
                    {siteConfig.name}
                  </span>
                  <span className="text-[7.5px] sm:text-[9px] uppercase tracking-[0.2em] text-rose-500 font-semibold leading-tight hidden xs:block">
                    {siteConfig.tagline}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {mainNavigation.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "text-xs uppercase tracking-wider font-semibold py-1.5 transition-colors relative",
                        isActive
                          ? "text-rose-600 font-bold"
                          : "text-neutral-700 hover:text-rose-600"
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute left-0 -bottom-0.5 w-full h-[2px] bg-rose-500 transition-transform duration-200 origin-left rounded-full",
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </Link>

                    {/* Desktop Dropdown Menu if children present */}
                    {item.children && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="bg-white border border-rose-100 rounded-xl shadow-xl py-2 min-w-[210px] backdrop-blur-md">
                          {item.children.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="block px-4 py-2 text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
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

              {/* Desktop Search Icon */}
              <Link
                href="/search"
                aria-label="Search products"
                className="hidden lg:inline-flex p-2 text-neutral-700 hover:text-rose-600 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-400 rounded-full"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </Link>

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

              {/* Shopping Bag / Cart */}
              <Link
                href="/cart"
                aria-label={`Shopping Bag (${itemCount} items)`}
                className="p-2 text-neutral-700 hover:text-rose-600 transition-colors relative focus:outline-none focus:ring-1 focus:ring-rose-400 rounded-full active:scale-90"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs animate-scale-in">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Bag ({itemCount})</span>
              </Link>
            </div>
          </div>

          {/* Native Mobile App Search Pill (Visible only on mobile) */}
          <div className="mt-2.5 lg:hidden">
            <Link
              href="/search"
              className="w-full h-9 px-3.5 rounded-full bg-rose-50/70 hover:bg-rose-100/60 border border-rose-200/70 flex items-center gap-2.5 text-xs text-neutral-500 shadow-2xs transition-colors"
            >
              <Search className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-light tracking-wide truncate">
                Search kurtis, frocks, gowns, trinketz...
              </span>
            </Link>
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
