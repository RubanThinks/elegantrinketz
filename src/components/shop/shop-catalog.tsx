"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowUpDown,
  Check,
  RefreshCw,
  SlidersHorizontal,
  X,
  Sparkles,
  Percent,
  Layers,
  ChevronDown,
} from "lucide-react";
import type { ProductCardData, Category, ProductSize } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";

interface ExtendedProductCardData extends ProductCardData {
  categorySlug?: string;
  categoryId?: string;
  price: number;
  compareAtPrice?: number;
  createdAt?: string;
  sizes?: ProductSize[];
}

interface ShopCatalogProps {
  initialProducts: ExtendedProductCardData[];
  categories: Category[];
  initialMaxPrice?: number;
  initialMinPrice?: number;
}

type SortOption = "featured" | "newest" | "price-asc" | "price-desc";
type DiscountOption = "all" | "10" | "20" | "30" | "40" | "bestseller";

export function ShopCatalog({
  initialProducts,
  categories,
  initialMaxPrice,
  initialMinPrice,
}: ShopCatalogProps) {
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [includeOutOfStock, setIncludeOutOfStock] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState<DiscountOption>("all");

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Calibrate price range slider: ₹0 to ₹5,000 (or higher if catalog has premium items)
  const maxCatalogPrice = useMemo(() => {
    if (initialProducts.length === 0) return 5000;
    const highest = Math.max(...initialProducts.map((p) => p.price || 0));
    return highest > 5000 ? Math.ceil(highest / 500) * 500 : 5000;
  }, [initialProducts]);

  const [sliderPrice, setSliderPrice] = useState<number>(
    typeof initialMaxPrice === "number" ? initialMaxPrice : maxCatalogPrice
  );

  useEffect(() => {
    if (typeof initialMaxPrice === "number") {
      setSliderPrice(initialMaxPrice);
    } else {
      setSliderPrice(maxCatalogPrice);
    }
  }, [initialMaxPrice, maxCatalogPrice]);

  // Extract all distinct sizes available across products
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    initialProducts.forEach((p) => {
      p.sizes?.forEach((s) => {
        if (s.name && s.name.trim()) {
          sizeSet.add(s.name.trim());
        }
      });
    });
    // Natural order of standard sizes if present
    const standardOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];
    return Array.from(sizeSet).sort((a, b) => {
      const idxA = standardOrder.indexOf(a);
      const idxB = standardOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [initialProducts]);

  // Helper to calculate product discount percentage
  const getProductDiscount = (p: ExtendedProductCardData): number => {
    if (p.compareAtPrice && p.compareAtPrice > p.price) {
      return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
    }
    return 0;
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Filter and Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Price Range Cursor Slider
    result = result.filter((p) => p.price <= sliderPrice);

    // 2. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          p.categorySlug === selectedCategory ||
          p.categoryId === selectedCategory
      );
    }

    // 3. Availability Filter (Flipkart / Amazon style)
    if (!includeOutOfStock) {
      result = result.filter((p) => !p.isOutOfStock);
    }

    // 4. Sizes Filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        if (!p.sizes || p.sizes.length === 0) return false;
        return p.sizes.some(
          (s) =>
            selectedSizes.includes(s.name) &&
            (includeOutOfStock || s.stock > 0 || s.isAvailable !== false)
        );
      });
    }

    // 5. Best Deals / Discounts Filter
    if (minDiscount !== "all") {
      if (minDiscount === "bestseller") {
        result = result.filter((p) => p.isBestSeller);
      } else {
        const threshold = Number(minDiscount);
        result = result.filter((p) => getProductDiscount(p) >= threshold);
      }
    }

    // 6. Sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
      case "featured":
      default:
        result.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [
    initialProducts,
    sliderPrice,
    selectedCategory,
    includeOutOfStock,
    selectedSizes,
    minDiscount,
    sortOption,
  ]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (sliderPrice < maxCatalogPrice ? 1 : 0) +
    (selectedSizes.length > 0 ? selectedSizes.length : 0) +
    (minDiscount !== "all" ? 1 : 0) +
    (includeOutOfStock ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSortOption("featured");
    setIncludeOutOfStock(false);
    setSelectedSizes([]);
    setMinDiscount("all");
    setSliderPrice(maxCatalogPrice);
  };

  // Reusable Filter Sidebar Content (used in both desktop sidebar and mobile drawer)
  const FilterControls = (
    <div className="space-y-6">
      {/* Price Range Slider (Flipkart & Amazon UI Cursor) */}
      <div className="pb-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Price Range
          </label>
          <span className="text-xs font-bold text-[#881337] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Up to ₹{sliderPrice.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Range Cursor Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={maxCatalogPrice}
            step={50}
            value={sliderPrice}
            onChange={(e) => setSliderPrice(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#881337]"
            aria-label="Price range filter"
          />
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
            <span>₹0</span>
            <span>₹{(maxCatalogPrice / 2).toLocaleString("en-IN")}</span>
            <span>₹{maxCatalogPrice.toLocaleString("en-IN")}+</span>
          </div>
        </div>

        {/* Quick Budget Shortcuts */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-neutral-100">
          {[499, 799, 999, 1499].map((bPrice) => (
            <button
              key={bPrice}
              type="button"
              onClick={() => setSliderPrice(bPrice)}
              className={cn(
                "px-2 py-1 text-[11px] font-medium rounded border transition-colors text-center cursor-pointer",
                sliderPrice === bPrice
                  ? "bg-[#881337] text-white border-[#881337]"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-[#881337] hover:text-[#881337]"
              )}
            >
              Under ₹{bPrice}
            </button>
          ))}
        </div>
      </div>

      {/* Best Deals & Discounts (Flipkart & Amazon Style) */}
      <div className="pb-6 border-b border-neutral-200">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-3">
          Deals & Discounts
        </label>
        <div className="space-y-2">
          {[
            { id: "all", label: "All Items" },
            { id: "bestseller", label: "Bestseller Deals ⭐" },
            { id: "40", label: "40% Off or more" },
            { id: "30", label: "30% Off or more" },
            { id: "20", label: "20% Off or more" },
            { id: "10", label: "10% Off or more" },
          ].map((deal) => (
            <label
              key={deal.id}
              className="flex items-center gap-2.5 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer font-medium"
            >
              <input
                type="radio"
                name="discount-filter"
                checked={minDiscount === deal.id}
                onChange={() => setMinDiscount(deal.id as DiscountOption)}
                className="w-4 h-4 text-[#881337] focus:ring-[#881337] border-neutral-300 accent-[#881337]"
              />
              <span>{deal.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes Filter (Only displayed if sizes exist in inventory) */}
      {availableSizes.length > 0 && (
        <div className="pb-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Select Size
            </label>
            {selectedSizes.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSizes([])}
                className="text-[11px] text-[#881337] hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={cn(
                    "min-w-10 px-3 py-1.5 text-xs font-bold rounded-md border transition-all cursor-pointer text-center",
                    isSelected
                      ? "bg-[#881337] text-white border-[#881337] shadow-xs"
                      : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Availability Filter (Flipkart & Amazon Style) */}
      <div className="pb-6 border-b border-neutral-200">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-3">
          Availability
        </label>
        <label className="flex items-center gap-2.5 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={includeOutOfStock}
            onChange={(e) => setIncludeOutOfStock(e.target.checked)}
            className="w-4 h-4 text-[#881337] rounded border-neutral-300 focus:ring-[#881337] accent-[#881337]"
          />
          <span>Include Out of Stock</span>
        </label>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-3">
            Category
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between font-medium cursor-pointer",
                selectedCategory === "all"
                  ? "bg-rose-50 text-[#881337] font-bold"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <span>All Categories</span>
              <span className="text-[11px] text-neutral-400">({initialProducts.length})</span>
            </button>
            {categories.map((cat) => {
              const count = initialProducts.filter(
                (p) => p.categoryId === cat.id || p.categorySlug === cat.slug
              ).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between font-medium cursor-pointer",
                    selectedCategory === (cat.slug || cat.id)
                      ? "bg-rose-50 text-[#881337] font-bold"
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[11px] text-neutral-400 shrink-0">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Mobile/Desktop Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        {/* Left: Mobile Filter Button & Product Count */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#881337]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#881337] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Showing <span className="font-bold text-neutral-900">{filteredAndSortedProducts.length}</span> of {initialProducts.length} Creations
          </span>
        </div>

        {/* Right: Quick In-Stock Toggle & Sort Dropdown (Amazon & Flipkart Style) */}
        <div className="flex items-center gap-3">
          <label className="hidden sm:flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!includeOutOfStock}
              onChange={(e) => setIncludeOutOfStock(!e.target.checked)}
              className="w-4 h-4 text-[#881337] rounded border-neutral-300 focus:ring-[#881337] accent-[#881337]"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="pl-8 pr-8 py-2 text-xs uppercase tracking-wider bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:border-[#881337] font-semibold cursor-pointer appearance-none transition-colors shadow-2xs"
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

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1">
            Active:
          </span>

          {sliderPrice < maxCatalogPrice && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#881337] text-xs font-semibold">
              <span>Up to ₹{sliderPrice.toLocaleString("en-IN")}</span>
              <button
                type="button"
                onClick={() => setSliderPrice(maxCatalogPrice)}
                className="hover:text-rose-950 font-bold ml-0.5 cursor-pointer"
                aria-label="Remove price filter"
              >
                ×
              </button>
            </span>
          )}

          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#881337] text-xs font-semibold">
              <span>Category: {categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name || selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="hover:text-rose-950 font-bold ml-0.5 cursor-pointer"
                aria-label="Remove category filter"
              >
                ×
              </button>
            </span>
          )}

          {minDiscount !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#881337] text-xs font-semibold">
              <span>
                {minDiscount === "bestseller"
                  ? "Bestsellers"
                  : `${minDiscount}%+ Off`}
              </span>
              <button
                type="button"
                onClick={() => setMinDiscount("all")}
                className="hover:text-rose-950 font-bold ml-0.5 cursor-pointer"
                aria-label="Remove discount filter"
              >
                ×
              </button>
            </span>
          )}

          {selectedSizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#881337] text-xs font-semibold"
            >
              <span>Size: {size}</span>
              <button
                type="button"
                onClick={() => handleSizeToggle(size)}
                className="hover:text-rose-950 font-bold ml-0.5 cursor-pointer"
                aria-label={`Remove size ${size} filter`}
              >
                ×
              </button>
            </span>
          ))}

          {includeOutOfStock && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-semibold">
              <span>Included Out of Stock</span>
              <button
                type="button"
                onClick={() => setIncludeOutOfStock(false)}
                className="hover:text-neutral-950 font-bold ml-0.5 cursor-pointer"
                aria-label="Remove out of stock filter"
              >
                ×
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-[#881337] font-bold hover:underline flex items-center gap-1 ml-2 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Layout: Desktop Sidebar (1 col) + Product Grid (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar (Amazon / Flipkart Style) */}
        <aside className="hidden lg:block lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs sticky top-24">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#881337]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Filters
              </h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-[#881337] hover:underline font-bold cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {FilterControls}
        </aside>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3">
          {filteredAndSortedProducts.length > 0 ? (
            <ProductGrid products={filteredAndSortedProducts} />
          ) : (
            <EmptyState
              title="No Products Match Your Filter"
              description="Try adjusting your price slider, clearing selected sizes or reset filters to see more creations."
              actionText="Reset All Filters"
              onAction={resetAllFilters}
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Modal (Amazon & Flipkart Style) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#881337]" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-900">
                  Filters & Sorting
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-200"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="p-5 overflow-y-auto flex-1">
              {FilterControls}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 border-t border-neutral-200 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-2.5 px-4 border border-neutral-300 text-neutral-700 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#881337] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#4c0519] transition-colors shadow-sm"
              >
                Apply ({filteredAndSortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
