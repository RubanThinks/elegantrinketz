"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronRight, ShoppingBag, Heart, User, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/config/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/providers/wishlist-provider";
import { useCart } from "@/providers/cart-provider";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { isAuthenticated, user, profile } = useAuth();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I'd like to know more about your collections.`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-300 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-xs bg-white text-[#1a1a1a] h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        {/* Top Header with Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e0d8]">
          <Link
            href="/"
            onClick={onClose}
            className="inline-flex items-center gap-2.5 group"
            aria-label={`${siteConfig.name} — Home`}
          >
            <div className="relative w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-xs shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-[2px]">
                <Image
                  src={siteConfig.logo}
                  alt={siteConfig.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-sm text-[#1a1a1a] leading-tight">
                {siteConfig.name}
              </span>
              <span className="text-[8.5px] uppercase tracking-[0.16em] text-[#888] font-medium leading-tight">
                {siteConfig.tagline}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 -mr-2 text-[#999] hover:text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Icon Links */}
        <div className="grid grid-cols-4 border-b border-[#e8e0d8] bg-[#fff9f5] py-3 text-center">
          <Link
            href="/search"
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-[11px] text-[#666] hover:text-[#1a1a1a]"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-[11px] text-[#666] hover:text-[#1a1a1a] relative"
          >
            <div className="relative">
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-[#E9A0B8] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </Link>
          <Link
            href="/cart"
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-[11px] text-[#666] hover:text-[#1a1a1a] relative"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-[#111] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </div>
            <span>Bag</span>
          </Link>
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-[11px] text-[#666] hover:text-[#1a1a1a]"
          >
            {isAuthenticated && user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt={profile?.displayName || "Account"}
                width={16}
                height={16}
                unoptimized
                className="w-4 h-4 rounded-full object-cover ring-1 ring-[#D4AF37]"
              />
            ) : (
              <User className={`w-4 h-4 ${isAuthenticated ? "text-[#D4AF37]" : ""}`} />
            )}
            <span>{isAuthenticated ? "Account" : "Sign In"}</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-[#b8a99c] font-medium">
              Explore
            </p>
            <ul className="space-y-3">
              {mainNavigation.map((item) => (
                <li key={item.label} className="border-b border-[#e8e0d8]/60 pb-2">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between text-base font-medium text-[#1a1a1a] hover:text-[#D4AF37]"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#ccc]" />
                  </Link>

                  {/* Sub items if present */}
                  {item.children && (
                    <ul className="mt-2 ml-3 space-y-1.5 border-l border-[#e8e0d8] pl-3">
                      {item.children.map((sub) => (
                        <li key={sub.label}>
                          <Link
                            href={sub.href}
                            onClick={onClose}
                            className="block text-xs text-[#888] hover:text-[#1a1a1a] py-0.5"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[10px] uppercase tracking-widest text-[#b8a99c] font-medium">
              Information
            </p>
            <div className="flex flex-col space-y-2 text-sm text-[#666]">
              <Link href="/about" onClick={onClose} className="hover:text-[#1a1a1a]">
                About Us
              </Link>
              <Link href="/contact" onClick={onClose} className="hover:text-[#1a1a1a]">
                Contact
              </Link>
              <Link href="/shipping" onClick={onClose} className="hover:text-[#1a1a1a]">
                Shipping & Returns
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer — WhatsApp CTA & Brand */}
        <div className="p-5 border-t border-[#e8e0d8] bg-[#fff9f5] space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#20BD5A] transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat with us on WhatsApp</span>
          </a>
          <div className="text-center">
            <p className="text-[10px] text-[#b8a99c] tracking-wider uppercase">
              {siteConfig.tagline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
