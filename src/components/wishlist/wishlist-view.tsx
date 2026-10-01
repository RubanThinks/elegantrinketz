"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/providers/wishlist-provider";
import { getProductsByIds, toProductCardData } from "@/services/products";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";

export function WishlistView() {
  const { wishlistProductIds, isLoading: isWishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function fetchWishlistProducts() {
      if (wishlistProductIds.length === 0) {
        setProducts([]);
        setIsProductsLoading(false);
        return;
      }

      setIsProductsLoading(true);
      try {
        const fetched = await getProductsByIds(wishlistProductIds);
        if (active) {
          setProducts(fetched);
        }
      } catch (err) {
        console.error("Failed to fetch wishlisted products:", err);
      } finally {
        if (active) {
          setIsProductsLoading(false);
        }
      }
    }

    fetchWishlistProducts();

    return () => {
      active = false;
    };
  }, [wishlistProductIds]);

  const isLoading = isWishlistLoading || isProductsLoading;

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-wider text-neutral-400">
          Loading Saved Creations...
        </p>
      </div>
    );
  }

  if (wishlistProductIds.length === 0 || products.length === 0) {
    return (
      <EmptyState
        icon="wishlist"
        title="Your Wishlist is Empty"
        description="Explore our atelier collections and bookmark your favourite creations to revisit anytime."
        actionHref="/shop"
        actionLabel="Explore Collections"
      />
    );
  }

  const cardData = products.map(toProductCardData);

  return (
    <div className="space-y-8">
      {/* Wishlist Header Meta */}
      <div className="flex items-center justify-between py-3 border-y border-neutral-200/80 text-xs uppercase tracking-wider text-neutral-500">
        <span>
          {products.length} {products.length === 1 ? "Item" : "Items"} Saved
        </span>
        <Link href="/shop" className="text-neutral-900 hover:text-rose-600 transition-colors font-medium">
          Continue Shopping &rarr;
        </Link>
      </div>

      {/* Grid of Wishlisted Products */}
      <ProductGrid products={cardData} />
    </div>
  );
}
