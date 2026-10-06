"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpDown, Check, RefreshCw } from "lucide-react";
import type { ProductCardData, Category } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";

interface ShopCatalogProps {
  initialProducts: (ProductCardData & {
    categorySlug?: string;
    categoryId?: string;
    price: number;
    createdAt?: string;
  })[];
  categories: Category[];
}

type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export function ShopCatalog({ initialProducts, categories }: ShopCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          p.categorySlug === selectedCategory ||
          p.categoryId === selectedCategory
      );
    }

    // Filter by Stock Status
    if (inStockOnly) {
      result = result.filter((p) => !p.isOutOfStock);
    }

    // Sort
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Products with isNew first, or sorted by id/createdAt
        result.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
      case "featured":
      default:
        // Default ordering maintains bestseller and featured priorities
        result.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [initialProducts, selectedCategory, sortOption, inStockOnly]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSortOption("featured");
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== "all" || inStockOnly || sortOption !== "featured";

  return (
    <div className="space-y-8">
      {/* Category Pills & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
        {/* Categories Tab Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap",
              selectedCategory === "all"
                ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
            )}
          >
            All Styles ({initialProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug || cat.id)}
              className={cn(
                "px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap",
                selectedCategory === (cat.slug || cat.id)
                  ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sorting & Availability Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          {/* In-Stock Toggle */}
          <button
            type="button"
            onClick={() => setInStockOnly((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-medium rounded-lg border transition-all cursor-pointer",
              inStockOnly
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
            )}
            aria-pressed={inStockOnly}
          >
            <span
              className={cn(
                "w-3 h-3 rounded-full border flex items-center justify-center transition-colors",
                inStockOnly ? "bg-rose-600 border-rose-600" : "border-neutral-400"
              )}
            >
              {inStockOnly && <Check className="w-2 h-2 text-white stroke-[3]" />}
            </span>
            <span>In Stock Only</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="pl-8 pr-8 py-2 text-xs uppercase tracking-wider bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:border-neutral-900 font-medium cursor-pointer appearance-none transition-colors"
              aria-label="Sort products by"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-500 uppercase tracking-wider">
        <span>
          Showing {filteredAndSortedProducts.length} of {initialProducts.length} Items
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Grid or Filter Empty State */}
      {filteredAndSortedProducts.length > 0 ? (
        <ProductGrid products={filteredAndSortedProducts} />
      ) : (
        <EmptyState
          title="No Products Match Your Filter"
          description="Try adjusting your category selection or clearing the in-stock filter to see more creations."
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      )}
    </div>
  );
}
