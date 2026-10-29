"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  HelpCircle,
  Package,
  MapPin,
  LogOut,
  ArrowRight,
  Truck,
  MessageCircle,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/config/navigation";
import { MobileDrawer } from "@/components/navigation/mobile-drawer";
import { HeaderSearch } from "@/components/search/header-search";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/providers/wishlist-provider";
import { useCart } from "@/providers/cart-provider";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { getCategories } from "@/services/categories";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

export function Header() {
  const { isAuthenticated, user, profile, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    getCategories().then((res) => {
      if (active && res) {
        setCategories(res);
      }
    });
    return () => {
      active = false;
    };
  }, []);

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

            {/* Desktop Navigation Links — Luxury Boutique Pill Buttons */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              {mainNavigation.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || (item.href !== "/shop" && pathname.startsWith(item.href));

                const isProducts = item.label === "Products";
                // Only build dropdown items if categories are actually listed by the user
                const dropdownCategories = isProducts && categories.length > 0 ? categories : [];
                const hasDropdown = dropdownCategories.length > 0;

                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer shadow-xs select-none tracking-normal font-sans",
                        isActive
                          ? "bg-gradient-to-r from-[#881337] to-[#500724] text-white border-[#881337] shadow-sm scale-102"
                          : "bg-rose-50/70 text-rose-950 border-rose-200/80 hover:bg-rose-100 hover:border-rose-300 hover:text-[#881337]"
                      )}
                    >
                      <span>{item.label}</span>
                      {hasDropdown && (
                        <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                      )}
                    </Link>

                    {/* Dynamic Dropdown for Products: Only user-defined categories */}
                    {hasDropdown && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="bg-white border-2 border-rose-200/90 rounded-2xl shadow-xl py-2 min-w-[220px] overflow-hidden">
                          <Link
                            href="/shop"
                            className="block px-4 py-2.5 text-xs font-bold text-[#881337] hover:bg-rose-50 border-b border-rose-100/70 transition-colors"
                          >
                            All Products
                          </Link>
                          {dropdownCategories.map((cat) => (
                            <Link
                              key={cat.id || cat.slug}
                              href={`/shop/${cat.slug || cat.id}`}
                              className="block px-4 py-2.5 text-xs font-semibold text-neutral-800 hover:text-white hover:bg-gradient-to-r hover:from-[#881337] hover:to-[#be123c] transition-colors"
                            >
                              {cat.name}
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
              <div className="hidden lg:block w-52 xl:w-64">
                <HeaderSearch placeholder="Search for products, brands..." />
              </div>

              {/* Desktop Help & Support Quick Menu */}
              <div className="relative group hidden lg:block">
                <button
                  type="button"
                  aria-label="Help & Support"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:text-[#881337] bg-rose-50/70 hover:bg-rose-100 border border-rose-200/90 rounded-full transition-all shadow-xs cursor-pointer select-none"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#881337]" />
                  <span>Help</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {/* Help Flyout Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 min-w-[240px]">
                  <div className="bg-white border-2 border-rose-200/90 rounded-2xl shadow-xl overflow-hidden py-1 divide-y divide-rose-100/70">
                    <div className="px-3.5 py-2.5 bg-gradient-to-r from-rose-50 to-amber-50/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
                        Help &amp; Customer Support
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        Assisting you daily 10 AM - 8 PM
                      </p>
                    </div>

                    <div className="py-1">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                        <span>WhatsApp Chat Support</span>
                      </a>

                      <Link
                        href="/contact"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-[#881337] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-rose-500" />
                        <span>Customer Help Desk</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-[#881337] transition-colors"
                      >
                        <Truck className="w-4 h-4 text-rose-500" />
                        <span>Track Order Status</span>
                      </Link>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/shipping"
                        className="block px-3.5 py-1.5 text-[11px] text-neutral-600 hover:text-[#881337] hover:bg-rose-50/60 transition-colors"
                      >
                        Shipping &amp; Delivery Policy
                      </Link>
                      <Link
                        href="/returns"
                        className="block px-3.5 py-1.5 text-[11px] text-neutral-600 hover:text-[#881337] hover:bg-rose-50/60 transition-colors"
                      >
                        Returns &amp; Exchanges Policy
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Circular Account Button + "Account & Help" Flyout Menu (Desktop) */}
              <div className="relative group hidden sm:inline-block">
                <Link
                  href={isAuthenticated ? "/account" : "/login"}
                  aria-label={isAuthenticated ? "My Account & Help" : "Sign In & Help"}
                  className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100 text-[#881337] hover:border-rose-300 transition-all duration-200 shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#881337]/20 mx-0.5 sm:mx-1 cursor-pointer overflow-hidden p-1"
                >
                  {isAuthenticated && user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={profile?.displayName || "Account"}
                      width={32}
                      height={32}
                      unoptimized
                      className="w-full h-full rounded-full object-cover ring-1 ring-rose-300"
                    />
                  ) : (
                    <User className={cn("w-4 h-4 sm:w-5 sm:h-5 stroke-[2] text-[#881337]")} />
                  )}
                </Link>

                {/* Account & Help Flyout Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 min-w-[270px]">
                  <div className="bg-white border-2 border-rose-200/90 rounded-2xl shadow-xl overflow-hidden py-1 divide-y divide-rose-100/70">
                    {/* Header Greeting */}
                    <div className="p-3.5 bg-gradient-to-r from-rose-50 to-amber-50/50">
                      {isAuthenticated ? (
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-rose-800">
                            Welcome back
                          </p>
                          <p className="text-xs font-bold text-neutral-900 truncate">
                            {profile?.displayName || user?.displayName || "Shopper"}
                          </p>
                          {user?.email && (
                            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-bold text-neutral-900">Welcome to {siteConfig.name}</p>
                            <p className="text-[11px] text-neutral-500">Sign in to access your orders &amp; account</p>
                          </div>
                          <Link
                            href="/login"
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#881337] to-[#500724] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
                          >
                            <span>Sign In / Register</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Account Section */}
                    <div className="py-1">
                      <div className="px-3 py-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Account
                        </p>
                      </div>
                      <Link
                        href={isAuthenticated ? "/account" : "/login"}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-[#881337] transition-colors"
                      >
                        <User className="w-4 h-4 text-rose-500" />
                        <span>Profile Dashboard</span>
                      </Link>
                      <Link
                        href={isAuthenticated ? "/account/orders" : "/login"}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-[#881337] transition-colors"
                      >
                        <Package className="w-4 h-4 text-rose-500" />
                        <span>Track Orders</span>
                      </Link>
                      <Link
                        href={isAuthenticated ? "/account/addresses" : "/login"}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-[#881337] transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Saved Addresses &amp; Reseller</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-[#881337] transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Saved Wishlist</span>
                      </Link>
                    </div>

                    {/* Help Section */}
                    <div className="py-1">
                      <div className="px-3 py-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Help &amp; Support
                        </p>
                      </div>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <Link
                        href="/contact"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-[#881337] transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-rose-500" />
                        <span>Customer Help Desk</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    {isAuthenticated && (
                      <div className="p-1">
                        <button
                          type="button"
                          onClick={() => logout()}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Circular Wishlist Button */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100 text-[#881337] hover:border-rose-300 transition-all duration-200 relative shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#881337]/20 mx-0.5 sm:mx-1 p-2"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] text-[#881337]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#881337] to-[#be123c] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
                <span className="sr-only">Wishlist ({wishlistCount})</span>
              </Link>

              {/* Circular Shopping Cart Button */}
              <Link
                href="/cart"
                aria-label={`Shopping Cart (${itemCount} items)`}
                className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100 text-[#881337] hover:border-rose-300 transition-all duration-200 relative shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#881337]/20 mx-0.5 sm:mx-1 p-2"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] text-[#881337]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#881337] to-[#be123c] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart ({itemCount})</span>
              </Link>
            </div>
          </div>

          {/* Mobile Live Search Bar (Amazon & Flipkart style with real-time auto-suggestions) */}
          <div className="mt-2.5 lg:hidden">
            <HeaderSearch isMobile placeholder="Search for products, brands and more..." />
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
