"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, X, Sparkles, FolderOpen, ArrowRight } from "lucide-react";
import { getProducts, toProductCardData } from "@/services/products";
import { getCategories } from "@/services/categories";
import type { Product, Category } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";
import Link from "next/link";

const POPULAR_SEARCH_TAGS = [
  "Side Cut Kurtis",
  "Umbrella Kurtis",
  "3 Piece Sets",
  "Straight Pants",
  "Shimmer Leggings",
  "Kurtis",
  "Festive Wear",
  "Trinketz",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync if query param changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, cats] = await Promise.all([
          getProducts({ limit: 100 }),
          getCategories(),
        ]);
        setProducts(prodRes.products || []);
        setCategories(cats || []);
      } catch (err) {
        console.error("Failed to load catalog for search:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categorySlug?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .map(toProductCardData);
  }, [query, products]);

  // Featured suggestions when no query is typed
  const trendingProducts = useMemo(() => {
    return products.slice(0, 4).map(toProductCardData);
  }, [products]);

  // Auto-suggestion keywords matching current query
  const querySuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const set = new Set<string>();

    POPULAR_SEARCH_TAGS.forEach((tag) => {
      if (tag.toLowerCase().includes(q)) set.add(tag);
    });

    products.forEach((p) => {
      if (p.name.toLowerCase().includes(q)) set.add(p.name);
      p.tags?.forEach((t) => {
        if (t.toLowerCase().includes(q)) set.add(t);
      });
    });

    return Array.from(set).slice(0, 6);
  }, [query, products]);

  const matchingCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return categories
      .filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
      .slice(0, 3);
  }, [query, categories]);

  const handleSelectQuery = (text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    router.replace(`/search?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="py-8 sm:py-14 bg-background min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header & Input Box (Amazon & Flipkart Style) */}
        <div className="max-w-2xl mx-auto text-center space-y-5 mb-10">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Catalog Search
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
            Search Creations
          </h1>

          <div className="relative w-full text-left">
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowSuggestions(false);
                    router.replace(`/search?q=${encodeURIComponent(query)}`);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search for kurtis, gowns, frocks, sarees, trinketz..."
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-neutral-300 rounded-2xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 placeholder:text-neutral-400 transition-all shadow-xs"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                    router.replace("/search");
                  }}
                  aria-label="Clear search query"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Auto-suggestions Dropdown on Search Page */}
            {showSuggestions && query.trim().length > 0 && querySuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-rose-100/90 shadow-2xl z-40 overflow-hidden divide-y divide-neutral-100 animate-in fade-in-50 duration-150">
                <div className="py-1">
                  {querySuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuery(item)}
                      className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-neutral-700 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <SearchIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                    </button>
                  ))}
                </div>

                {matchingCategories.length > 0 && (
                  <div className="p-3 bg-neutral-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-1">
                      In Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingCategories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/shop/${c.slug}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-rose-200 text-rose-700 text-xs font-medium hover:bg-rose-50"
                        >
                          <FolderOpen className="w-3 h-3 text-rose-500" />
                          <span>{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 pt-1">
            <span className="text-neutral-400 text-[11px] font-medium">Popular:</span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSelectQuery(tag)}
                className="px-3 py-1 bg-white border border-neutral-200 hover:border-rose-400 hover:text-rose-600 text-neutral-700 rounded-full transition-colors text-[11px] cursor-pointer shadow-2xs active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results / Empty states */}
        {query.trim().length > 0 ? (
          searchResults.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200/70">
                <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  Found <span className="font-bold text-neutral-900">{searchResults.length}</span> {searchResults.length === 1 ? "design" : "designs"} for &ldquo;{query}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    router.replace("/search");
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Clear Results
                </button>
              </div>
              <ProductGrid products={searchResults} />
            </div>
          ) : (
            <EmptyState
              icon="search"
              title={`No results found for "${query}"`}
              description="Try adjusting your search terms or discover our complete collection."
              actionHref="/shop"
              actionText="View All Creations"
            />
          )
        ) : (
          <div className="space-y-8">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-rose-600 rounded-full animate-spin" />
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Loading Catalogue...
                </p>
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="space-y-6 pt-4 border-t border-neutral-200/70">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Trending Creations</span>
                </div>
                <ProductGrid products={trendingProducts} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-wider text-neutral-400">Loading Search...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
