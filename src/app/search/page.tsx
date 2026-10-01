"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, X, Sparkles } from "lucide-react";
import { getProducts, toProductCardData } from "@/services/products";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await getProducts({ limit: 100 });
        setProducts(res.products);
      } catch (err) {
        console.error("Failed to load catalog for search:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
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

  return (
    <div className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header & Input Box */}
        <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Catalog Search
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
            Search Creations
          </h1>

          <div className="relative w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for sarees, anarkalis, lehengas, silk, SKU..."
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 placeholder:text-neutral-400 transition-all shadow-xs"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search query"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 pt-1">
            <span className="text-neutral-400 text-[11px]">Popular:</span>
            {["Saree", "Anarkali", "Lehenga", "Silk", "Kurti"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="px-3 py-1 bg-white border border-neutral-200 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 rounded-full transition-colors text-[11px] cursor-pointer"
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
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                Found {searchResults.length} {searchResults.length === 1 ? "design" : "designs"} for &ldquo;{query}&rdquo;
              </p>
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
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
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
