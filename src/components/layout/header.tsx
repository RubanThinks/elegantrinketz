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
      setIsScrolled(window.scrollY > 20);
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
          "sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-sm border-b",
          isScrolled
            ? "border-[#e8e0d8] shadow-[0_2px_10px_rgba(0,0,0,0.04)] py-2"
            : "border-[#e8e0d8]/50 py-3 sm:py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Hamburger (left on mobile) */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 -ml-2 text-[#1a1a1a] hover:text-black focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo & Name with Circular Placeholder */}
            <div className="flex items-center">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-95"
                aria-label={`${siteConfig.name} — Home`}
              >
                {/* Circular Placeholder for Logo */}
                <div
                  className={cn(
                    "relative rounded-full p-[1.5px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-xs group-hover:shadow-md transition-all duration-300 shrink-0",
                    isScrolled ? "w-9 h-9 sm:w-10 sm:h-10" : "w-10 h-10 sm:w-11 sm:h-11"
                  )}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-[2px]">
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

                {/* Brand Wordmark & Tagline */}
                <div className="flex flex-col text-left">
                  <span className="font-serif font-bold text-sm sm:text-base text-[#1a1a1a] tracking-tight sm:tracking-wide leading-tight group-hover:text-[#D4AF37] transition-colors">
                    {siteConfig.name}
                  </span>
                  <span className="text-[8px] sm:text-[9.5px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#888] font-medium leading-tight hidden xs:block">
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
                          ? "text-[#D4AF37] font-bold"
                          : "text-[#1a1a1a] hover:text-[#D4AF37]"
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute left-0 -bottom-0.5 w-full h-[2px] bg-[#D4AF37] transition-transform duration-200 origin-left rounded-full",
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </Link>

                    {/* Desktop Dropdown Menu if children present */}
                    {item.children && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="bg-white border border-[#e8e0d8] shadow-lg py-2 min-w-[200px]">
                          {item.children.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="block px-4 py-2 text-xs text-[#666] hover:text-[#1a1a1a] hover:bg-[#fff9f5] transition-colors"
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
            <div className="flex items-center space-x-1 sm:space-x-2.5">
              {/* WhatsApp CTA — desktop only */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#25D366] border border-[#25D366]/30 rounded-full hover:bg-[#25D366]/10 transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Chat</span>
              </a>

              {/* Search */}
              <Link
                href="/search"
                aria-label="Search products"
                className="p-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </Link>

              {/* Account (hidden on mobile, accessible via drawer) */}
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                aria-label={isAuthenticated ? "My Account" : "Sign In"}
                className="hidden sm:inline-flex p-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors focus:outline-none focus:ring-1 focus:ring-[#D4AF37] items-center justify-center"
              >
                {isAuthenticated && user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={profile?.displayName || "Account"}
                    width={20}
                    height={20}
                    unoptimized
                    className="w-5 h-5 rounded-full object-cover ring-1.5 ring-[#D4AF37]"
                  />
                ) : (
                  <User className={cn("w-5 h-5 stroke-[1.5]", isAuthenticated && "text-[#D4AF37]")} />
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors relative focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E9A0B8] text-white text-[10px] font-bold flex items-center justify-center leading-none animate-scale-in">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
                <span className="sr-only">Wishlist ({wishlistCount})</span>
              </Link>

              {/* Shopping Bag / Cart */}
              <Link
                href="/cart"
                aria-label={`Shopping Bag (${itemCount} items)`}
                className="p-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors relative focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center leading-none animate-scale-in">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Bag ({itemCount})</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
