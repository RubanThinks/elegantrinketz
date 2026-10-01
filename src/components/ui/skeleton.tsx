import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer bg-neutral-200/70 rounded-md", className)}
      {...props}
    />
  );
}

/** Product card skeleton mirroring the modern 3:4 ProductCard layout */
export function ProductSkeleton() {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-white border border-neutral-100 p-3 space-y-3 shadow-xs">
      {/* 3:4 portrait image skeleton */}
      <Skeleton className="w-full aspect-[3/4] rounded-lg" />
      {/* Category / tag */}
      <Skeleton className="h-3 w-1/3 rounded-sm" />
      {/* Title */}
      <Skeleton className="h-4 w-3/4 rounded-sm" />
      {/* Price */}
      <Skeleton className="h-4 w-1/4 rounded-sm" />
    </div>
  );
}

/** Grid skeleton mirroring responsive ProductGrid */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

/** Category circular story skeleton */
export function CategoryStorySkeleton() {
  return (
    <div className="flex flex-col items-center space-y-2 shrink-0">
      <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
      <Skeleton className="h-3 w-14 rounded-full" />
    </div>
  );
}

/** General page skeleton for route transitions */
export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full rounded-sm" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
