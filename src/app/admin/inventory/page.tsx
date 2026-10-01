"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAdminProducts,
  updateProductInventory,
  calculateProductInventory,
} from "@/services/products";
import { useAuth } from "@/providers/auth-provider";
import type { Product, ProductSize, InventoryStatus } from "@/types";

export default function AdminInventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filterState, setFilterState] = useState<InventoryStatus | "all">("all");

  // Track modified sizes per product before saving: productId -> ProductSize[]
  const [editingStockMap, setEditingStockMap] = useState<Record<string, ProductSize[]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminProducts({
        inventoryStatus: filterState,
        search: searchTerm,
      });
      setProducts(res.products);

      // Initialize editing map
      const initialMap: Record<string, ProductSize[]> = {};
      res.products.forEach((p) => {
        initialMap[p.id] = p.sizes.map((s) => ({ ...s }));
      });
      setEditingStockMap(initialMap);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const res = await getAdminProducts({
          inventoryStatus: filterState,
          search: activeSearch,
        });
        if (!ignore) {
          setProducts(res.products);
          const initialMap: Record<string, ProductSize[]> = {};
          res.products.forEach((p) => {
            initialMap[p.id] = p.sizes.map((s) => ({ ...s }));
          });
          setEditingStockMap(initialMap);
        }
      } catch (err) {
        console.error("Failed to load inventory:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [filterState, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  // Modify stock in local state with non-negative guarantee
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

  // Persist updated stock variants to Firestore
  const handleSaveInventory = async (productId: string) => {
    const sizesToSave = editingStockMap[productId];
    if (!sizesToSave) return;

    setSavingId(productId);
    try {
      await updateProductInventory(productId, sizesToSave, user?.uid);
      setSavedSuccessId(productId);
      setTimeout(() => setSavedSuccessId(null), 3000);
      await loadData();
    } catch (err) {
      alert((err as Error).message || "Failed to update inventory.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time variant stock tracking. In Stock (&gt;3), Low Stock (1–3), and Out of Stock (0).
          </p>
        </div>

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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by product name, SKU, or slug..."
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="text-xs">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 text-xs">
          <span className="text-neutral-500 font-medium">Stock Status:</span>
          {(["all", "in_stock", "low_stock", "out_of_stock"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterState(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                filterState === st
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {st === "all" && "All Products"}
              {st === "in_stock" && "In Stock (>3)"}
              {st === "low_stock" && "Low Stock (1-3)"}
              {st === "out_of_stock" && "Out of Stock (0)"}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            Loading inventory stock...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-800">
              No matching inventory found
            </h3>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query or stock filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {products.map((product) => {
              const currentSizes = editingStockMap[product.id] || product.sizes;
              const { totalStock, inventoryStatus } = calculateProductInventory(
                currentSizes
              );
              const isSaving = savingId === product.id;
              const isSuccess = savedSuccessId === product.id;

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-3.5 min-w-[260px] max-w-sm">
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
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-semibold text-xs text-neutral-900 hover:text-rose-600 transition-colors truncate block"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        SKU: <span className="text-neutral-800 font-semibold">{product.sku}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {inventoryStatus === "in_stock" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> In Stock ({totalStock})
                          </span>
                        )}
                        {inventoryStatus === "low_stock" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> Low ({totalStock})
                          </span>
                        )}
                        {inventoryStatus === "out_of_stock" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size Variants In-Place Editor */}
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    {currentSizes.map((sz, index) => {
                      const isZero = sz.stock === 0;
                      const isLow = sz.stock > 0 && sz.stock <= 3;

                      return (
                        <div
                          key={sz.id || sz.name}
                          className={`flex items-center border rounded-xl px-2.5 py-1.5 bg-white shadow-2xs gap-2 transition-all ${
                            isZero
                              ? "border-red-200 bg-red-50/20"
                              : isLow
                              ? "border-amber-200 bg-amber-50/20"
                              : "border-neutral-200"
                          }`}
                        >
                          <span className="text-[11px] font-bold text-neutral-700 w-8 truncate">
                            {sz.name}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={sz.stock}
                            onChange={(e) =>
                              handleStockChange(product.id, index, e.target.value)
                            }
                            className="w-16 px-1.5 py-0.5 border border-neutral-300 rounded-lg text-xs font-mono text-center text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Action */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveInventory(product.id)}
                      isLoading={isSaving}
                      className={`text-xs font-semibold ${
                        isSuccess
                          ? "border-emerald-500 text-emerald-600 bg-emerald-50"
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
                          Update Stock
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
