"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import type { Product, ProductSize } from "@/types";
import { siteConfig } from "@/config/site";
import { formatPrice, getDiscountPercentage } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/providers/wishlist-provider";
import { useCart } from "@/providers/cart-provider";
import { cn } from "@/lib/utils";

interface ProductDetailActionsProps {
  product: Product;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    // Default to the first in-stock size if available
    const firstInStock = product.sizes?.find((s) => s.isAvailable && s.stock > 0);
    return firstInStock ? firstInStock.name : null;
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddedConfirmation, setShowAddedConfirmation] = useState(false);

  const isSaved = isInWishlist(product.id);

  const hasDiscount = Boolean(
    product.compareAtPrice && product.compareAtPrice > product.price
  );
  const discountPercent =
    hasDiscount && product.compareAtPrice
      ? getDiscountPercentage(product.price, product.compareAtPrice)
      : 0;

  const currentSizeObj: ProductSize | undefined = product.sizes?.find(
    (s) => s.name === selectedSize
  );

  // Maximum stock available for current selection
  const totalStock = product.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0) ?? 0;
  const maxStock = currentSizeObj ? currentSizeObj.stock : totalStock;
  const isAvailableStock = maxStock > 0 && !product.isOutOfStock;

  const handleSelectSize = (sizeName: string) => {
    setSelectedSize(sizeName);
    setSizeError(false);
    setShowAddedConfirmation(false);

    // If new size has less stock than currently selected quantity, clamp it
    const newSizeObj = product.sizes?.find((s) => s.name === sizeName);
    if (newSizeObj && newSizeObj.stock > 0 && quantity > newSizeObj.stock) {
      setQuantity(newSizeObj.stock);
    }
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity((prev) => {
      if (maxStock > 0 && prev >= maxStock) {
        return prev;
      }
      return prev + 1;
    });
  };

  const handleAddToCart = async () => {
    // Check if size is required and not chosen
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }

    if (!isAvailableStock) {
      return;
    }

    setIsAdding(true);
    try {
      const success = await addItem({
        productId: product.id,
        sizeId: currentSizeObj?.id || selectedSize || null,
        sizeName: selectedSize || null,
        quantity,
        unitPrice: product.price,
        productName: product.name,
        productSlug: product.slug,
        sku: product.sku,
        image: product.images?.primary,
        maxStock,
      });

      if (success) {
        setShowAddedConfirmation(true);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Build dynamic single-product WhatsApp enquiry text
  const cleanPhone = siteConfig.whatsappNumber
    ? siteConfig.whatsappNumber.replace(/[^0-9]/g, "")
    : "";

  const encodedWhatsAppMessage = encodeURIComponent(
    `Hello ${siteConfig.name}, I have a question regarding:\n\n*${product.name}*\nPrice: ${formatPrice(product.price)}\nSKU: ${product.sku}${selectedSize ? `\nSize: ${selectedSize}` : ""}\nLink: ${siteConfig.url}/products/${product.slug}\n\nCould you please confirm availability or styling advice?`
  );

  const whatsAppEnquiryUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedWhatsAppMessage}`
    : "#";

  return (
    <div className="space-y-6">
      {/* Pricing Header */}
      <div className="flex items-baseline space-x-3 pb-4 border-b border-neutral-200/70">
        <span className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
          {formatPrice(product.price)}
        </span>
        {hasDiscount && product.compareAtPrice && (
          <>
            <span className="text-base text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Save {discountPercent}%
            </span>
          </>
        )}
        <span className="text-xs text-neutral-500 font-light">
          Ordering &amp; delivery details confirmed on WhatsApp
        </span>
      </div>

      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-neutral-800 font-semibold">
                Select Size
              </span>
              {selectedSize && (
                <span className="text-xs text-neutral-500">
                  — Selected: <strong className="text-neutral-900">{selectedSize}</strong>
                </span>
              )}
            </div>
            <Link
              href="/size-guide"
              className="text-xs text-rose-600 hover:text-rose-700 underline underline-offset-2 font-medium"
            >
              Size Guide
            </Link>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((s) => {
              const inStock = s.isAvailable && s.stock > 0;
              const isSelected = selectedSize === s.name;

              return (
                <button
                  key={s.id || s.name}
                  type="button"
                  disabled={!inStock}
                  onClick={() => handleSelectSize(s.name)}
                  className={cn(
                    "relative px-4 py-2.5 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer select-none",
                    inStock && !isSelected &&
                      "bg-white border-neutral-300 text-neutral-800 hover:border-neutral-900 hover:bg-neutral-50",
                    inStock && isSelected &&
                      "bg-neutral-900 border-neutral-900 text-white shadow-sm ring-2 ring-neutral-900/20",
                    !inStock &&
                      "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed line-through opacity-70"
                  )}
                  aria-label={`${s.name} size ${inStock ? "" : "(Sold out)"}`}
                >
                  <span>{s.name}</span>
                  {inStock && s.stock > 0 && s.stock <= 3 && (
                    <span
                      className={cn(
                        "ml-1.5 text-[10px] font-normal",
                        isSelected ? "text-rose-200" : "text-rose-600"
                      )}
                    >
                      ({s.stock} left)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {sizeError && (
            <p className="text-xs text-rose-600 font-medium animate-shake">
              Please choose a size before adding to your bag.
            </p>
          )}

          {currentSizeObj && currentSizeObj.stock > 0 && currentSizeObj.stock <= 3 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2">
              ⚡ High demand: Only {currentSizeObj.stock} unit{currentSizeObj.stock > 1 ? "s" : ""} left in size {currentSizeObj.name}.
            </p>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      {isAvailableStock && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-800 font-semibold">
              Quantity
            </span>
            {maxStock > 0 && (
              <span className="text-xs text-neutral-500">
                Max available: <strong>{maxStock}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center border border-neutral-300 rounded-lg bg-white">
              <button
                type="button"
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1}
                aria-label={`Decrease quantity for ${product.name}`}
                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center text-sm font-semibold text-neutral-900 select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleQuantityIncrease}
                disabled={maxStock > 0 && quantity >= maxStock}
                aria-label={`Increase quantity for ${product.name}`}
                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-neutral-500">
              Total: <strong>{formatPrice(product.price * quantity)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Add to Bag CTA */}
        {!isAvailableStock ? (
          <Button
            variant="primary"
            size="lg"
            disabled
            className="w-full text-xs sm:text-sm uppercase tracking-wider font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-sm bg-neutral-300 text-neutral-500 cursor-not-allowed"
          >
            <span>Currently Sold Out</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={isAdding}
            onClick={handleAddToCart}
            className="w-full text-xs sm:text-sm uppercase tracking-wider font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-sm bg-neutral-900 hover:bg-neutral-950 text-white transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isAdding ? "Adding to Bag..." : "Add to Bag"}</span>
          </Button>
        )}

        {/* Polished Confirmation Banner (Inline, does not force leaving page) */}
        {showAddedConfirmation && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/90 text-emerald-950 space-y-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-900">
                  Added to your bag!
                </p>
                <p className="text-xs text-emerald-800 font-light mt-0.5">
                  {product.name} {selectedSize ? `· Size ${selectedSize}` : ""} × {quantity}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/cart" className="block">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full text-[11px] uppercase tracking-wider font-semibold bg-emerald-800 hover:bg-emerald-900 text-white py-2 rounded-md flex items-center justify-center gap-1.5"
                >
                  <span>View Bag</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddedConfirmation(false)}
                className="w-full text-[11px] uppercase tracking-wider font-semibold border-emerald-300 text-emerald-800 hover:bg-emerald-100/70 py-2 rounded-md"
              >
                <span>Continue Shopping</span>
              </Button>
            </div>
          </div>
        )}

        {/* Secondary Actions: Wishlist & WhatsApp Direct Enquiry */}
        <div className="grid grid-cols-2 gap-3">
          {/* Wishlist Button */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => toggleWishlist(product.id)}
            className={cn(
              "w-full text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 border-neutral-300 py-3 rounded-lg hover:border-neutral-900 transition-colors",
              isSaved && "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isSaved ? "fill-rose-600 text-rose-600" : "text-neutral-600"
              )}
            />
            <span>{isSaved ? "Saved" : "Wishlist"}</span>
          </Button>

          {/* Ask on WhatsApp */}
          {cleanPhone ? (
            <a
              href={whatsAppEnquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 py-3 rounded-lg"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                <span>Ask on WhatsApp</span>
              </Button>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
