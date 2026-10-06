"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Save,
  Check,
  Plus,
  Minus,
  Boxes,
  Layers,
  ArrowUpDown,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAdminProducts,
  updateProductInventory,
  calculateProductInventory,
} from "@/services/products";
import { getCategories } from "@/services/categories";
import { useAuth } from "@/providers/auth-provider";
import type { Product, ProductSize, InventoryStatus, Category } from "@/types";

type SortOption = "default" | "stock_asc" | "stock_desc" | "name_asc";

export default function AdminInventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterState, setFilterState] = useState<InventoryStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Track modified sizes per product before saving: productId -> ProductSize[]
  const [editingStockMap, setEditingStockMap] = useState<Record<string, ProductSize[]>>({});
  const [originalStockMap, setOriginalStockMap] = useState<Record<string, ProductSize[]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, catList] = await Promise.all([
        getAdminProducts({
          inventoryStatus: filterState,
          search: activeSearch,
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          pageSize: 100,
        }),
        getCategories().catch(() => []),
      ]);

      setProducts(productsRes.products);
      setCategories(catList);

      const initialMap: Record<string, ProductSize[]> = {};
      productsRes.products.forEach((p) => {
        initialMap[p.id] = p.sizes.map((s) => ({ ...s }));
      });
      setEditingStockMap(initialMap);
      setOriginalStockMap(initialMap);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState, activeSearch, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  // Modify stock in local state with non-negative integer guarantee
  const handleStockChange = (productId: string, sizeIndex: number, valStr: string) => {
    const rawVal = parseInt(valStr, 10);
    const cleanStock = isNaN(rawVal) ? 0 : Math.max(0, rawVal);

    setEditingStockMap((prev) => {
      const currentSizes = prev[productId] || [];
      const updated = currentSizes.map((item, idx) => {
        if (idx === sizeIndex) {
          return {
            ...item,
            stock: cleanStock,
            isAvailable: cleanStock > 0,
          };
        }
        return item;
      });
      return { ...prev, [productId]: updated };
    });
  };

  // Quick increment/decrement helper
  const handleStockDelta = (productId: string, sizeIndex: number, delta: number) => {
    setEditingStockMap((prev) => {
      const currentSizes = prev[productId] || [];
      const updated = currentSizes.map((item, idx) => {
        if (idx === sizeIndex) {
          const currentStock = Number(item.stock) || 0;
          const nextStock = Math.max(0, currentStock + delta);
          return {
            ...item,
            stock: nextStock,
            isAvailable: nextStock > 0,
          };
        }
        return item;
      });
      return { ...prev, [productId]: updated };
    });
  };

  // Bulk size adjustment per product (+5 each, or set all to 0)
  const handleQuickAdjustAllSizes = (productId: string, action: "add5" | "zero" | "reset") => {
    setEditingStockMap((prev) => {
      if (action === "reset") {
        return {
          ...prev,
          [productId]: (originalStockMap[productId] || []).map((s) => ({ ...s })),
        };
      }

      const currentSizes = prev[productId] || [];
      const updated = currentSizes.map((s) => {
        const nextStock = action === "zero" ? 0 : (Number(s.stock) || 0) + 5;
        return {
          ...s,
          stock: nextStock,
          isAvailable: nextStock > 0,
        };
      });
      return { ...prev, [productId]: updated };
    });
  };

  // Check if a product has unsaved edits
  const hasUnsavedChanges = (productId: string) => {
    const current = editingStockMap[productId];
    const orig = originalStockMap[productId];
    if (!current || !orig) return false;
    return JSON.stringify(current) !== JSON.stringify(orig);
  };

  // List of product IDs with unsaved changes
  const unsavedProductIds = useMemo(() => {
    return products.map((p) => p.id).filter(hasUnsavedChanges);
  }, [products, editingStockMap, originalStockMap]);

  // Persist updated stock variants to Firestore
  const handleSaveInventory = async (productId: string) => {
    const sizesToSave = editingStockMap[productId];
    if (!sizesToSave) return;

    setSavingId(productId);
    try {
      await updateProductInventory(productId, sizesToSave, user?.uid);
      setSavedSuccessId(productId);
      setOriginalStockMap((prev) => ({
        ...prev,
        [productId]: sizesToSave.map((s) => ({ ...s })),
      }));
      setTimeout(() => setSavedSuccessId(null), 3000);
    } catch (err) {
      alert((err as Error).message || "Failed to update inventory.");
    } finally {
      setSavingId(null);
    }
  };

  // Save all modified products in one click
  const handleSaveAll = async () => {
    if (unsavedProductIds.length === 0) return;
    setIsSavingAll(true);
    try {
      for (const id of unsavedProductIds) {
        const sizesToSave = editingStockMap[id];
        if (sizesToSave) {
          await updateProductInventory(id, sizesToSave, user?.uid);
        }
      }
      setOriginalStockMap({ ...editingStockMap });
      alert("All inventory changes saved successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to save some inventory items.");
    } finally {
      setIsSavingAll(false);
    }
  };

  // Inventory KPI calculations
  const inventoryStats = useMemo(() => {
    let totalPhysicalUnits = 0;
    let inStockProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    products.forEach((p) => {
      const currentSizes = editingStockMap[p.id] || p.sizes;
      const { totalStock, inventoryStatus } = calculateProductInventory(currentSizes);
      totalPhysicalUnits += totalStock;
      if (inventoryStatus === "in_stock") inStockProducts++;
      else if (inventoryStatus === "low_stock") lowStockProducts++;
      else if (inventoryStatus === "out_of_stock") outOfStockProducts++;
    });

    return {
      totalProducts: products.length,
      totalPhysicalUnits,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
    };
  }, [products, editingStockMap]);

  // Sorted products display
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "name_asc") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "stock_asc") {
      return list.sort((a, b) => {
        const sA = calculateProductInventory(editingStockMap[a.id] || a.sizes).totalStock;
        const sB = calculateProductInventory(editingStockMap[b.id] || b.sizes).totalStock;
        return sA - sB;
      });
    }
    if (sortBy === "stock_desc") {
      return list.sort((a, b) => {
        const sA = calculateProductInventory(editingStockMap[a.id] || a.sizes).totalStock;
        const sB = calculateProductInventory(editingStockMap[b.id] || b.sizes).totalStock;
        return sB - sA;
      });
    }
    return list;
  }, [products, editingStockMap, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Inventory & Stock Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700">
              Salem Workshop Hub
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time workshop & warehouse inventory tracking across all sizes, SKUs, and categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unsavedProductIds.length > 0 && (
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {isSavingAll ? "Saving..." : `Save All Changes (${unsavedProductIds.length})`}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Stock
          </Button>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Catalog Items */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Catalog Items</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{inventoryStats.totalProducts}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Active styles in store</p>
        </div>

        {/* Total Physical Stock Units */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Pieces</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{inventoryStats.totalPhysicalUnits}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Total units across all sizes</p>
        </div>

        {/* In Stock */}
        <button
          type="button"
          onClick={() => setFilterState("in_stock")}
          className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
            filterState === "in_stock"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20"
              : "bg-white border-neutral-200/90 hover:border-emerald-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">In Stock</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{inventoryStats.inStockProducts}</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">&gt; 3 units available</p>
        </button>

        {/* Low Stock Alert */}
        <button
          type="button"
          onClick={() => setFilterState("low_stock")}
          className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
            filterState === "low_stock"
              ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20"
              : "bg-white border-neutral-200/90 hover:border-amber-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{inventoryStats.lowStockProducts}</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">1–3 units left (Reorder)</p>
        </button>

        {/* Out of Stock */}
        <button
          type="button"
          onClick={() => setFilterState("out_of_stock")}
          className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
            filterState === "out_of_stock"
              ? "bg-red-50/70 border-red-300 ring-2 ring-red-500/20"
              : "bg-white border-neutral-200/90 hover:border-red-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Out of Stock</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-red-700">{inventoryStats.outOfStockProducts}</p>
          <p className="text-[10px] text-red-600/80 mt-0.5">0 units available</p>
        </button>
      </div>

      {/* Restocking Urgency Banner if low/out of stock items exist */}
      {(inventoryStats.outOfStockProducts > 0 || inventoryStats.lowStockProducts > 0) && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-amber-900 font-medium">
              <span className="font-bold">{inventoryStats.outOfStockProducts}</span> product(s) are completely out of stock and{" "}
              <span className="font-bold">{inventoryStats.lowStockProducts}</span> have critical low stock. Restock in Salem workshop to prevent lost orders.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {inventoryStats.outOfStockProducts > 0 && (
              <button
                type="button"
                onClick={() => setFilterState("out_of_stock")}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition-colors"
              >
                View Out of Stock ({inventoryStats.outOfStockProducts})
              </button>
            )}
            {inventoryStats.lowStockProducts > 0 && (
              <button
                type="button"
                onClick={() => setFilterState("low_stock")}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors"
              >
                View Low Stock ({inventoryStats.lowStockProducts})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by product name, SKU, or keyword..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="text-xs">
              Search
            </Button>
          </form>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-800 bg-white focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-800 bg-white focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            >
              <option value="default">Sort: Default</option>
              <option value="stock_asc">Sort: Stock Low to High (Urgent)</option>
              <option value="stock_desc">Sort: Stock High to Low</option>
              <option value="name_asc">Sort: Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Stock Status Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          <span className="text-neutral-500 font-medium mr-1">Status:</span>
          {(["all", "in_stock", "low_stock", "out_of_stock"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterState(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                filterState === st
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {st === "all" && `All (${products.length})`}
              {st === "in_stock" && `In Stock (${inventoryStats.inStockProducts})`}
              {st === "low_stock" && `Low Stock (${inventoryStats.lowStockProducts})`}
              {st === "out_of_stock" && `Out of Stock (${inventoryStats.outOfStockProducts})`}
            </button>
          ))}

          {unsavedProductIds.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {unsavedProductIds.length} Unsaved Changes
            </span>
          )}
        </div>
      </div>

      {/* Inventory Table / Product Cards */}
      <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-300" />
            Loading workshop & warehouse inventory...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-800">
              No matching inventory found
            </h3>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query, category, or stock status filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {sortedProducts.map((product) => {
              const currentSizes = editingStockMap[product.id] || product.sizes;
              const { totalStock, inventoryStatus } = calculateProductInventory(currentSizes);
              const isSaving = savingId === product.id;
              const isSuccess = savedSuccessId === product.id;
              const isDirty = hasUnsavedChanges(product.id);

              return (
                <div
                  key={product.id}
                  className={`p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-colors ${
                    isDirty ? "bg-amber-50/20" : "hover:bg-neutral-50/50"
                  }`}
                >
                  {/* Product Info & Identity */}
                  <div className="flex items-center gap-3.5 min-w-[280px] max-w-sm">
                    <div className="w-12 h-16 rounded-xl bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                      {product.images?.primary ? (
                        <Image
                          src={product.images.primary}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="font-semibold text-xs text-neutral-900 hover:text-rose-600 transition-colors truncate block"
                          title="View live product"
                        >
                          {product.name}
                        </Link>
                        <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] font-mono text-neutral-500">
                          SKU: <span className="text-neutral-800 font-semibold">{product.sku}</span>
                        </p>
                        {product.categoryName && (
                          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-medium">
                            {product.categoryName}
                          </span>
                        )}
                      </div>

                      {/* Live Stock Status Indicator */}
                      <div className="mt-1.5 flex items-center gap-2">
                        {inventoryStatus === "in_stock" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> In Stock ({totalStock} units)
                          </span>
                        )}
                        {inventoryStatus === "low_stock" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> Low Stock ({totalStock} units left)
                          </span>
                        )}
                        {inventoryStatus === "out_of_stock" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <XCircle className="w-3 h-3" /> Out of Stock (0 units)
                          </span>
                        )}

                        {isDirty && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded">
                            Unsaved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size Variants Controls Matrix */}
                  <div className="flex-1 flex flex-wrap items-center gap-2.5">
                    {currentSizes.map((sz, index) => {
                      const isZero = sz.stock === 0;
                      const isLow = sz.stock > 0 && sz.stock <= 3;

                      return (
                        <div
                          key={sz.id || sz.name}
                          className={`flex items-center border rounded-xl px-2 py-1.5 bg-white shadow-2xs gap-1.5 transition-all ${
                            isZero
                              ? "border-red-300 bg-red-50/30"
                              : isLow
                              ? "border-amber-300 bg-amber-50/30"
                              : "border-neutral-200"
                          }`}
                        >
                          <span className="text-[11px] font-bold text-neutral-800 w-7 text-center">
                            {sz.name}
                          </span>

                          {/* Decrement Button */}
                          <button
                            type="button"
                            onClick={() => handleStockDelta(product.id, index, -1)}
                            disabled={sz.stock <= 0}
                            className="w-5 h-5 flex items-center justify-center rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Decrease 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          {/* Numeric Stock Input */}
                          <input
                            type="number"
                            min="0"
                            value={sz.stock}
                            onChange={(e) =>
                              handleStockChange(product.id, index, e.target.value)
                            }
                            className={`w-12 px-1 py-0.5 border rounded text-xs font-mono text-center font-bold focus:outline-none focus:ring-1 ${
                              isZero
                                ? "text-red-700 border-red-300 focus:border-red-500 focus:ring-red-500"
                                : isLow
                                ? "text-amber-800 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                                : "text-neutral-900 border-neutral-300 focus:border-rose-600 focus:ring-rose-600"
                            }`}
                          />

                          {/* Increment Button */}
                          <button
                            type="button"
                            onClick={() => handleStockDelta(product.id, index, 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                            title="Increase 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Quick batch modifiers for this product */}
                    <div className="flex items-center gap-1 pl-1">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjustAllSizes(product.id, "add5")}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                        title="Add +5 pieces to all size variants"
                      >
                        +5 All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjustAllSizes(product.id, "zero")}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                        title="Zero out all sizes (Mark out of stock)"
                      >
                        Zero All
                      </button>
                      {isDirty && (
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustAllSizes(product.id, "reset")}
                          className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Discard changes"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions (Save / Edit) */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-medium transition-colors"
                    >
                      Edit Product
                    </Link>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveInventory(product.id)}
                      isLoading={isSaving}
                      className={`text-xs font-semibold transition-all ${
                        isSuccess
                          ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                          : isDirty
                          ? "bg-rose-600 text-white hover:bg-rose-700 border-rose-600 shadow-xs"
                          : ""
                      }`}
                    >
                      {isSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-1" />
                          {isDirty ? "Save Updates" : "Update Stock"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
