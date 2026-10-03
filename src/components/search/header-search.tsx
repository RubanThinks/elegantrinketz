"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Sparkles, ShoppingBag, FolderOpen, TrendingUp } from "lucide-react";
import { getProducts, toProductCardData } from "@/services/products";
import { getCategories } from "@/services/categories";
import type { Product, Category, ProductCardData } from "@/types";
import { formatPrice } from "@/config/constants";
import { cn } from "@/lib/utils";

const TRENDING_KEYWORDS = [
  "Kurtis",
  "Gowns",
  "Frocks",
  "Festive Wear",
  "Silk Sarees",
  "Anarkali",
  "Trinketz",
  "Western Wear",
];

interface HeaderSearchProps {
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
}

export function HeaderSearch({
  className,
  placeholder = "Search kurtis, frocks, gowns, trinketz...",
  isMobile = false,
}: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load catalog data when the user focuses the search bar
  const loadSearchData = async () => {
    if (hasLoadedData) return;
    try {
      const [prodRes, cats] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories(),
      ]);
      setProducts(prodRes.products || []);
      setCategories(cats || []);
      setHasLoadedData(true);
    } catch (err) {
      console.error("Failed to load catalog data for search suggestions:", err);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Compute suggestions based on query
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        keywords: TRENDING_KEYWORDS,
        matchingCategories: categories.slice(0, 4),
        matchingProducts: products.slice(0, 3).map(toProductCardData),
        isTrending: true,
      };
    }

    // 1. Keyword suggestions derived from product names, tags, categories
    const keywordSet = new Set<string>();

    // Add query-matching trending keywords
    TRENDING_KEYWORDS.forEach((kw) => {
      if (kw.toLowerCase().includes(q)) {
        keywordSet.add(kw);
      }
    });

    // Extract relevant phrases or tokens from products
    products.forEach((p) => {
      const name = p.name;
      if (name.toLowerCase().includes(q)) {
        keywordSet.add(name);
      }
      p.tags?.forEach((t) => {
        if (t.toLowerCase().includes(q)) {
          keywordSet.add(t);
        }
      });
    });

    const keywords = Array.from(keywordSet).slice(0, 5);

    // 2. Matching Categories
    const matchingCategories = categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      )
      .slice(0, 3);

    // 3. Matching Products
    const matchingProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categorySlug?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map(toProductCardData);

    return {
      keywords,
      matchingCategories,
      matchingProducts,
      isTrending: false,
    };
  }, [query, products, categories]);

  const handleSearchSubmit = (searchQuery?: string) => {
    const targetQuery = (searchQuery ?? query).trim();
    if (!targetQuery) return;
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(`/search?q=${encodeURIComponent(targetQuery)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="font-bold text-rose-600">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      role="search"
    >
      {/* Search Input Bar (Amazon & Flipkart style) */}
      <div className="relative w-full flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => {
            loadSearchData();
            setIsOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search catalogue"
          autoComplete="off"
          spellCheck="false"
          className="w-full h-10 sm:h-10.5 pl-10 pr-20 bg-white border border-neutral-300 hover:border-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all outline-none"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            aria-label="Execute search"
            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <span className="hidden sm:inline">Search</span>
            <Search className="w-3.5 h-3.5 sm:hidden" />
          </button>
        </div>
      </div>

      {/* Auto-Suggestions Floating Panel (Amazon & Flipkart Style) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-rose-100/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50 divide-y divide-neutral-100 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header Tag / State */}
          <div className="px-4 py-2 bg-neutral-50/70 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <div className="flex items-center gap-1.5">
              {suggestions.isTrending ? (
                <>
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>Popular & Trending Searches</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 text-rose-500" />
                  <span>Suggestions for &ldquo;{query}&rdquo;</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 text-[10px]"
            >
              Dismiss
            </button>
          </div>

          {/* 1. Keyword suggestions */}
          {suggestions.keywords.length > 0 && (
            <div className="py-1">
              {suggestions.keywords.map((kw, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearchSubmit(kw)}
                  className="w-full px-4 py-2 text-left text-xs text-neutral-700 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-500 shrink-0" />
                    <span className="truncate">
                      {suggestions.isTrending ? kw : highlightMatch(kw, query)}
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-300 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* 2. Category suggestions if any match */}
          {suggestions.matchingCategories.length > 0 && (
            <div className="p-3 bg-neutral-50/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-1">
                Matching Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.matchingCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop/${cat.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-rose-200/80 text-rose-700 hover:bg-rose-50 text-[11px] font-medium transition-colors shadow-2xs"
                  >
                    <FolderOpen className="w-3 h-3 text-rose-500" />
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Product Hit Previews (Thumbnails & Prices like Flipkart) */}
          {suggestions.matchingProducts.length > 0 && (
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1">
                {suggestions.isTrending ? "Featured Creations" : "Top Product Matches"}
              </p>
              {suggestions.matchingProducts.map((p) => (
                <Link
                  key={p.id}
                  href={p.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-rose-50/60 group transition-colors"
                >
                  <div className="relative w-10 h-12 rounded-md overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
                    {p.primaryImage ? (
                      <Image
                        src={p.primaryImage}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 group-hover:text-rose-600 truncate transition-colors">
                      {suggestions.isTrending ? p.name : highlightMatch(p.name, query)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-neutral-900">
                        {formatPrice(p.price)}
                      </span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="text-[10px] text-neutral-400 line-through">
                          {formatPrice(p.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-rose-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* Bottom Callout: View all results */}
          {query.trim().length > 0 && (
            <div className="p-2 bg-neutral-50/80">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View all search results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
