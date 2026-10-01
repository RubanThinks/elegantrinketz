import React from "react";
import type { ProductCardData } from "@/types";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export interface ProductGridProps {
  products: ProductCardData[];
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ProductGrid({
  products,
  className,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
