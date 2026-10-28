"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ChevronRight,
  ShoppingBag,
  Heart,
  User,
  Package,
  Layers,
  ArrowRight,
  Home,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/providers/auth-provider";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { getCategories } from "@/services/categories";
import type { Category } from "@/types";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { isAuthenticated, user, profile, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch active categories defined by the admin
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const fetched = await getCategories();
        if (isMounted) {
          setCategories(fetched || []);
        }
      } catch (err) {
        console.error("Failed to load categories for mobile drawer:", err);
      }
    }
    if (isOpen) {
      loadCategories();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

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
      {/* Solid Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body — Native Shopping App Drawer */}
      <div className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {/* Top User Card — Luxury Boutique Drawer Header */}
          <div className="bg-interlocked-triangles-luxury text-white p-5 relative select-none border-b border-amber-500/30">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 text-amber-200 border border-amber-400/30 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Greeting */}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-rose-400 shrink-0 overflow-hidden shadow-sm">
                {isAuthenticated && user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={profile?.displayName || "Profile"}
                    width={44}
                    height={44}
                    unoptimized
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <p className="text-[10px] uppercase tracking-wider text-rose-200/80 font-semibold font-flipkart">
                  {isAuthenticated ? "Welcome Back" : "Welcome"}
                </p>
                <h3 className="font-bold text-sm truncate font-flipkart text-amber-200">
                  {isAuthenticated
                    ? profile?.displayName || user?.displayName || "Shopper"
                    : "Fashion Shopper"}
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
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-300" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={onClose}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-300" />
                    <span>Wishlist</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Primary Navigation Pill Buttons */}
          <div className="p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-1">
              Explore
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-950 font-bold text-xs transition-colors shadow-xs"
              >
                <Home className="w-4 h-4 text-[#881337]" />
                <span>Home</span>
              </Link>
              <Link
                href="/shop"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-950 font-bold text-xs transition-colors shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-[#881337]" />
                <span>Shop</span>
              </Link>
              <Link
                href="/collections"
                onClick={onClose}
                className="col-span-2 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-950 font-bold text-xs transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#881337]" />
                  <span>Collections</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
              </Link>
            </div>
          </div>

          {/* Core Categories List (Strictly User-Listed Categories Only) */}
          {categories.length > 0 && (
            <div className="px-4 py-2 space-y-1.5 border-t border-rose-100">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Categories
                </p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="text-[10px] font-bold text-[#881337] hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id || cat.slug}
                    href={`/shop/${cat.slug || cat.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 hover:bg-rose-50 hover:text-[#881337] border border-transparent hover:border-rose-200 transition-all group"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#881337] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="px-4 py-3 border-t border-rose-100/70 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-1 py-1">
              Account & Help
            </p>

            <Link
              href="/account/orders"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-rose-50 hover:text-rose-950 transition-colors"
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
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-rose-50 hover:text-rose-950 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-neutral-400" />
                <span>Saved Wishlist</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            </Link>
          </div>
        </div>

        {/* Bottom Drawer Bar: Customer Support Assistance */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20BD5A] transition-all shadow-md active:scale-98"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Customer Support Chat</span>
          </a>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full text-center text-[11px] font-bold text-neutral-500 hover:text-red-600 transition-colors py-1 cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
