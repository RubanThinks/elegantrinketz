"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ChevronRight,
  ShoppingBag,
  Heart,
  User,
  Package,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/providers/auth-provider";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Compact e-commerce category links
const quickCategories = [
  { label: "New Arrivals", href: "/shop/collection/new-arrivals", badge: "New", isHot: true },
  { label: "Bestsellers", href: "/shop/collection/best-sellers", badge: "Trending", isHot: true },
  { label: "Women's Wear", href: "/shop/womens-wear" },
  { label: "Ethnic Wear & Kurtis", href: "/shop/ethnic-wear" },
  { label: "Western Wear", href: "/shop/western-wear" },
  { label: "Gowns & Frocks", href: "/shop/gowns-frocks" },
  { label: "Festive & Party Wear", href: "/shop/festive-party-wear" },
  { label: "Kids Wear", href: "/shop/kids-wear" },
  { label: "Accessories & Trinketz", href: "/shop/accessories-trinketz" },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { isAuthenticated, user, profile, logout } = useAuth();

  // Prevent background body scroll when open
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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I need help with an order.`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App Menu"
      className="fixed inset-0 z-50 flex lg:hidden"
    >
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body — Native Shopping App Drawer */}
      <div className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {/* Top User Card (Myntra / Purplle style pink gradient card) */}
          <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white p-5 relative select-none">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Greeting */}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-12 h-12 rounded-full p-[2px] bg-white shadow-xs shrink-0 overflow-hidden">
                {isAuthenticated && user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={profile?.displayName || "Profile"}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <p className="text-[11px] uppercase tracking-wider text-pink-100 font-medium">
                  {isAuthenticated ? "Welcome Back" : "Welcome"}
                </p>
                <h3 className="font-bold text-base truncate">
                  {isAuthenticated
                    ? profile?.displayName || user?.displayName || "Shopper"
                    : "Fashion Explorer"}
                </h3>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="mt-4 flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="flex-1 py-1.5 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={onClose}
                    className="flex-1 py-1.5 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Wishlist</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-full bg-white text-rose-600 hover:bg-pink-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Core Categories List (Simple, fast, no junk) */}
          <div className="p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-3 py-1">
              Shop Categories
            </p>

            <div className="space-y-0.5">
              {quickCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-800 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    {cat.isHot ? (
                      <span className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                        {cat.badge === "Trending" ? (
                          <Flame className="w-3.5 h-3.5 fill-rose-500" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span>{cat.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cat.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-600 uppercase">
                        {cat.badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-rose-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="px-4 py-2 border-t border-rose-100/70 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-3 py-1">
              Account & Help
            </p>

            <Link
              href="/account/orders"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-neutral-400" />
                <span>Track Orders</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            </Link>

            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-neutral-400" />
                <span>Saved Wishlist</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            </Link>
          </div>
        </div>

        {/* Bottom Drawer Bar: WhatsApp Order Assistance */}
        <div className="p-4 border-t border-rose-100 bg-rose-50/40 space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition-all shadow-sm shadow-[#25D366]/20 active:scale-98"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Order via WhatsApp</span>
          </a>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full text-center text-[11px] font-medium text-neutral-400 hover:text-rose-600 transition-colors py-1"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
