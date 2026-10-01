"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAdminProducts,
  archiveProduct,
  publishProduct,
  unpublishProduct,
  calculateProductInventory,
} from "@/services/products";
import { getCategories } from "@/services/categories";
import { useAuth } from "@/providers/auth-provider";
import type { Product, Category, ProductStatus, InventoryStatus } from "@/types";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | "all">("all");
  const [selectedInventory, setSelectedInventory] = useState<InventoryStatus | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, cats] = await Promise.all([
        getAdminProducts({
          status: selectedStatus,
          inventoryStatus: selectedInventory,
          categoryId: selectedCategory,
          search: searchTerm,
        }),
        getCategories(),
      ]);
      setProducts(prodRes.products);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load admin products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const [prodRes, cats] = await Promise.all([
          getAdminProducts({
            status: selectedStatus,
            inventoryStatus: selectedInventory,
            categoryId: selectedCategory,
            search: activeSearch,
          }),
          getCategories(),
        ]);
        if (!ignore) {
          setProducts(prodRes.products);
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to load admin products:", err);
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
  }, [selectedStatus, selectedInventory, selectedCategory, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const handleTogglePublish = async (product: Product) => {
    setActionLoadingId(product.id);
    try {
      if (product.status === "published") {
        await unpublishProduct(product.id, user?.uid);
      } else {
        await publishProduct(product.id, user?.uid);
      }
      await loadData();
    } catch (err) {
      alert((err as Error).message || "Failed to update publish state");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product?")) return;
    setActionLoadingId(id);
    try {
      await archiveProduct(id, user?.uid);
      await loadData();
    } catch (err) {
      alert((err as Error).message || "Failed to archive product");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Products & Catalog
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your fashion catalog, Cloudinary photography, pricing, and variants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/admin/products/new">
            <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-xs">
              <Plus className="w-4 h-4 mr-1" />
              New Product
            </Button>
          </Link>
        </div>
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
              placeholder="Search by product name, SKU, or slug..."
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="text-xs">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ProductStatus | "all")}
            className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-800 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Inventory State Filter */}
          <select
            value={selectedInventory}
            onChange={(e) =>
              setSelectedInventory(e.target.value as InventoryStatus | "all")
            }
            className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-800 bg-white"
          >
            <option value="all">All Stock States</option>
            <option value="in_stock">In Stock (&gt;3)</option>
            <option value="low_stock">Low Stock (1-3)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-800 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            Loading products catalog...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-800">
              No products found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No products match your current search or filter criteria. Create a new product to begin.
            </p>
            <Link href="/admin/products/new">
              <Button variant="primary" size="sm" className="text-xs bg-rose-600">
                + Create Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 text-[10px] uppercase font-bold text-neutral-500 tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Inventory</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((product) => {
                  const { totalStock, inventoryStatus } = calculateProductInventory(
                    product.sizes
                  );
                  const isActionLoading = actionLoadingId === product.id;
                  const cat = categories.find((c) => c.id === product.categoryId);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                            {product.images?.primary ? (
                              <Image
                                src={product.images.primary}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 truncate max-w-xs sm:max-w-sm">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono truncate">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono font-medium text-neutral-700">
                        {product.sku || "—"}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-neutral-600">
                        {cat?.name || product.categoryName || "—"}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">
                          ₹{product.price.toLocaleString("en-IN")}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-[10px] text-neutral-400 line-through">
                            ₹{product.compareAtPrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* Inventory */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {inventoryStatus === "in_stock" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              {totalStock} in stock
                            </span>
                          )}
                          {inventoryStatus === "low_stock" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              Low ({totalStock})
                            </span>
                          )}
                          {inventoryStatus === "out_of_stock" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              <XCircle className="w-3 h-3" />
                              Out of stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {product.status === "published" && (
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            Published
                          </Badge>
                        )}
                        {product.status === "draft" && (
                          <Badge variant="outline" className="text-neutral-600 text-[10px]">
                            Draft
                          </Badge>
                        )}
                        {product.status === "archived" && (
                          <Badge variant="outline" className="text-red-500 border-red-200 text-[10px]">
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Storefront Preview */}
                          {product.slug && (
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Preview product on storefront"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Edit */}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Publish Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(product)}
                            disabled={isActionLoading}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                              product.status === "published"
                                ? "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {product.status === "published" ? "Unpublish" : "Publish"}
                          </button>

                          {/* Archive Button */}
                          {product.status !== "archived" && (
                            <button
                              type="button"
                              onClick={() => handleArchive(product.id)}
                              disabled={isActionLoading}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Archive product"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
