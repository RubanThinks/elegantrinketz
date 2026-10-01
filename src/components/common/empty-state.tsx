import React from "react";
import Link from "next/link";
import { ShoppingBag, Search, Heart, PackageOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: "cart" | "wishlist" | "search" | "product" | "category";
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "product",
  title,
  description,
  actionHref,
  actionLabel,
  actionText,
  onAction,
}: EmptyStateProps) {
  const finalActionLabel = actionLabel || actionText || (actionHref ? "Continue Shopping" : undefined);

  const renderIcon = () => {
    const iconClass = "w-10 h-10 text-neutral-400 stroke-[1.25]";
    switch (icon) {
      case "cart":
        return <ShoppingBag className={iconClass} aria-hidden="true" />;
      case "wishlist":
        return <Heart className={iconClass} aria-hidden="true" />;
      case "search":
        return <Search className={iconClass} aria-hidden="true" />;
      case "category":
        return <Layers className={iconClass} aria-hidden="true" />;
      case "product":
      default:
        return <PackageOpen className={iconClass} aria-hidden="true" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-serif tracking-tight text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed mb-6">
        {description}
      </p>
      {onAction && finalActionLabel && (
        <Button variant="primary" size="md" onClick={onAction}>
          {finalActionLabel}
        </Button>
      )}
      {!onAction && actionHref && finalActionLabel && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {finalActionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
