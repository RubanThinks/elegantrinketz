"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { Product, ProductSize, CartItem } from "@/types";
import { formatPrice, getDiscountPercentage } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/providers/wishlist-provider";
import { useCart } from "@/providers/cart-provider";
import { OnlineCheckoutModal } from "@/components/cart/online-checkout-modal";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { siteConfig } from "@/config/site";
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

  // Maximum stock available for current selection (supports variants & flat stock)
  const totalStock =
    product.sizes && product.sizes.length > 0
      ? product.sizes.reduce((acc, s) => acc + (s.stock || 0), 0)
      : ((product as any).totalStock ?? (product as any).stock ?? 0);
  const maxStock = currentSizeObj ? currentSizeObj.stock : totalStock;
  const isAvailableStock =
    maxStock > 0 &&
    !product.isOutOfStock &&
    (product as any).status !== "out_of_stock" &&
    (product as any).inventoryStatus !== "out_of_stock";

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

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);

  const handleBuyNow = () => {
    // Check if size is required and not chosen
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }

    if (!isAvailableStock) {
      return;
    }

    const now = new Date().toISOString();
    const singleItem: CartItem = {
      id: `direct-${product.id}-${currentSizeObj?.id || selectedSize || "std"}`,
      userId: "guest-direct",
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
      createdAt: now,
      updatedAt: now,
    };

    setDirectCheckoutItem(singleItem);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Amazon Exact PDP Pricing Hierarchy & Deal Psychography */}
      <div className="space-y-1.5 pb-4 border-b border-neutral-200/80 font-amazon">
        <div className="flex items-baseline gap-3 flex-wrap">
          {hasDiscount && discountPercent > 0 && (
            <span className="text-2xl font-light text-[#cc0c39]">
              -{discountPercent}%
            </span>
          )}
          <span className="amazon-pdp-price">
            {formatPrice(product.price)}
          </span>
        </div>

        {hasDiscount && product.compareAtPrice && (
          <div className="text-xs text-[#565959] space-x-1 font-amazon">
            <span>M.R.P.:</span>
            <span className="line-through">{formatPrice(product.compareAtPrice)}</span>
            <span className="text-[#388e3c] font-semibold ml-1">
              (You save {formatPrice(product.compareAtPrice - product.price)})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-0.5 text-xs text-[#565959]">
          <span>Inclusive of all taxes</span>
          <span>•</span>
          <span className="text-[#007600] font-semibold">FREE Delivery in Salem</span>
        </div>
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
                      "bg-white border-rose-200 text-neutral-800 hover:border-[#881337] hover:bg-rose-50/50",
                    inStock && isSelected &&
                      "bg-[#881337] border-[#881337] text-white shadow-sm ring-2 ring-[#881337]/20 font-bold",
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

      {/* Out of Stock Notice & WhatsApp Restock Enquiry */}
      {!isAvailableStock && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-950 space-y-1.5 animate-fade-in font-amazon">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <p className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Currently Out of Stock
            </p>
          </div>
          <p className="text-xs text-rose-800 font-light leading-relaxed">
            This piece is currently sold out. You can enquire directly on WhatsApp for upcoming restocks and pre-orders.
          </p>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
              `Hello ${siteConfig.name}, I would like to enquire about restock for: ${product.name} (SKU: ${product.sku || "N/A"})`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline pt-0.5"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span>Enquire for Restock on WhatsApp</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Add to Bag CTA (Flipkart warm yellow high-converting style) */}
          {!isAvailableStock ? (
            <Button
              variant="primary"
              size="lg"
              disabled
              className="w-full text-xs sm:text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs bg-neutral-200 text-neutral-400 cursor-not-allowed font-flipkart"
            >
              <span>Sold Out</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isAdding}
              onClick={handleAddToCart}
              className="w-full text-xs sm:text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 bg-[#FF9F00] hover:bg-[#F39700] active:scale-[0.98] text-white shadow-sm hover:shadow transition-all cursor-pointer font-flipkart"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>{isAdding ? "Adding..." : "Add to Bag"}</span>
            </Button>
          )}

          {/* Real E-Commerce Buy Now (Direct Razorpay Checkout) */}
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!isAvailableStock}
            onClick={handleBuyNow}
            className="w-full text-xs sm:text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 bg-[#FB641B] hover:bg-[#E85913] active:scale-[0.98] text-white shadow-sm hover:shadow-lg transition-all cursor-pointer font-flipkart"
          >
            <Zap className="w-4 h-4 fill-white text-white shrink-0" />
            <span>Buy Now</span>
          </Button>
        </div>

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

        {/* Secondary: Wishlist & Fast Delivery reassurance */}
        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toggleWishlist(product.id)}
            className={cn(
              "text-xs font-medium flex items-center gap-1.5 border-neutral-200 py-2 px-3 rounded-lg hover:border-neutral-900 transition-colors",
              isSaved && "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
            )}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                isSaved ? "fill-rose-600 text-rose-600" : "text-neutral-500"
              )}
            />
            <span>{isSaved ? "Saved to Wishlist" : "Save for Later"}</span>
          </Button>

          <span className="text-[11px] text-neutral-500 font-light">
            ⚡ 100% Secure Checkout · Instant Dispatch &amp; Fast Shipping
          </span>
        </div>
      </div>

      {/* Mobile App PWA Sticky Bottom Action Bar (Flipkart & Amazon mobile app feel) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-3 py-2 flex items-center gap-2.5 lg:hidden shadow-md pb-safe">
        {!isAvailableStock ? (
          <button
            type="button"
            disabled
            className="flex-1 h-11 bg-neutral-200 text-neutral-400 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed font-flipkart"
          >
            <span>Currently Sold Out</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={isAdding}
              onClick={handleAddToCart}
              className="flex-1 h-11 bg-[#FF9F00] hover:bg-[#F39700] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-transform cursor-pointer disabled:opacity-50 font-flipkart"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>{isAdding ? "Adding..." : "Add to Bag"}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 h-11 bg-[#FB641B] hover:bg-[#E85913] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-transform cursor-pointer font-flipkart"
            >
              <Zap className="w-4 h-4 fill-white text-white shrink-0" />
              <span>Buy Now</span>
            </button>
          </>
        )}
      </div>

      {/* Direct E-Commerce Checkout Modal */}
      <OnlineCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutItem(null);
        }}
        directItem={directCheckoutItem}
      />
    </div>
  );
}
