"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/providers/cart-provider";
import {
  validateCartItemsForOrder,
  buildWhatsAppOrderUrl,
  type CartValidationResult,
} from "@/services/cart/validation";
import { formatPrice } from "@/config/constants";
import { siteConfig } from "@/config/site";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartView() {
  const {
    items,
    itemCount,
    subtotal,
    isLoading: isCartLoading,
    updateQuantity,
    removeItem,
    clearCart,
    syncWithCurrentProducts,
  } = useCart();

  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<CartValidationResult | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Sync stored items with current published products when mounting
  useEffect(() => {
    syncWithCurrentProducts();
  }, [syncWithCurrentProducts]);

  const handleClearBag = async () => {
    await clearCart();
    setShowClearConfirm(false);
    setValidationResult(null);
    setOrderSuccessMessage(null);
  };

  const handleOrderOnWhatsApp = async () => {
    setIsValidating(true);
    setOrderSuccessMessage(null);

    try {
      // 1. Authoritative validation pass against fresh Firestore data
      const result = await validateCartItemsForOrder(items);
      setValidationResult(result);

      if (!result.isValid) {
        // Validation issues detected (stock reduced, price changed, unpublished)
        // Scroll to error banner if needed
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // 2. Build secure combined order WhatsApp link (NO automatic Firestore order creation)
      const { url, error } = buildWhatsAppOrderUrl(
        result.validatedItems,
        result.subtotal,
        result.totalQuantity
      );

      if (error) {
        setValidationResult({
          isValid: false,
          issues: [
            {
              productId: "",
              productName: "Store Settings",
              type: "out_of_stock",
              message: error,
            },
          ],
          validatedItems: [],
          subtotal: 0,
          totalQuantity: 0,
        });
        return;
      }

      // 3. Open WhatsApp in new tab / app
      window.open(url, "_blank", "noopener,noreferrer");

      // 4. Cart remains intact. Show feedback.
      setOrderSuccessMessage(
        "WhatsApp opened with your bag items! Send the message to connect with our stylist team to confirm availability and finalize your order."
      );
    } catch (err) {
      console.error("[CartView] WhatsApp order preparation failed:", err);
      setValidationResult({
        isValid: false,
        issues: [
          {
            productId: "",
            productName: "Connection Error",
            type: "out_of_stock",
            message: "Unable to verify current product stock. Please check your internet connection.",
          },
        ],
        validatedItems: [],
        subtotal: 0,
        totalQuantity: 0,
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Resolve validation issues automatically by updating cart to current prices & stock
  const handleAcknowledgeAndFix = async () => {
    if (!validationResult || validationResult.issues.length === 0) return;

    for (const issue of validationResult.issues) {
      const matchingItem = items.find(
        (i) =>
          i.id === issue.itemId ||
          (i.productId === issue.productId && (i.sizeId || null) === (issue.sizeId || null))
      );

      if (!matchingItem) continue;

      if (
        issue.type === "deleted" ||
        issue.type === "unpublished" ||
        issue.type === "size_unavailable" ||
        issue.type === "out_of_stock"
      ) {
        // Remove item that is completely unavailable
        if (matchingItem.id) {
          await removeItem(matchingItem.id);
        }
      } else if (issue.type === "insufficient_stock" && typeof issue.adjustedQuantity === "number") {
        // Clamp quantity to available stock
        if (matchingItem.id) {
          await updateQuantity(matchingItem.id, issue.adjustedQuantity, issue.availableStock);
        }
      } else if (issue.type === "price_changed") {
        // Re-sync with authoritative price
        await syncWithCurrentProducts();
      }
    }

    setValidationResult(null);
  };

  if (isCartLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-wider text-neutral-400">
          Loading your shopping bag...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 sm:py-16">
        <EmptyState
          icon="cart"
          title="Your bag is waiting for something you love."
          description="Explore our handcrafted collections and discover timeless pieces made for your story."
          actionHref="/shop"
          actionLabel="Continue Shopping"
        />
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header with Title and Clear Bag */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Order Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900 tracking-tight flex items-center gap-3">
            <span>Shopping Bag</span>
            <span className="text-sm font-sans font-normal text-neutral-500">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            &larr; Continue Shopping
          </Link>
          <span className="text-neutral-300">|</span>
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600">Clear all items?</span>
              <button
                type="button"
                onClick={handleClearBag}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
              >
                Yes, Clear
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Clear Bag
            </button>
          )}
        </div>
      </div>

      {/* Validation Issue Alert Banner (when price/stock changed) */}
      {validationResult && !validationResult.isValid && (
        <div className="p-4 sm:p-5 rounded-xl border border-amber-300 bg-amber-50/95 text-amber-900 space-y-3 animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h2 className="text-sm font-semibold text-amber-950">
                Please review changes to your shopping bag
              </h2>
              <p className="text-xs text-amber-800 leading-relaxed font-light">
                Some items have had stock or price adjustments since you added them. To ensure accurate ordering, please update your bag before proceeding to WhatsApp.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-amber-900 pt-1">
                {validationResult.issues.map((iss, idx) => (
                  <li key={idx}>{iss.message}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAcknowledgeAndFix}
              className="text-xs bg-amber-900 hover:bg-amber-950 text-white rounded-md py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Bag to Current Details</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValidationResult(null)}
              className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 rounded-md py-2 px-3"
            >
              Dismiss Notice
            </Button>
          </div>
        </div>
      )}

      {/* Order Opened Notice */}
      {orderSuccessMessage && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 flex-1">
            <p className="font-semibold text-emerald-950">{orderSuccessMessage}</p>
            <p className="text-emerald-800 font-light">
              Your bag has been kept intact in case you would like to review or make changes later.
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-neutral-200 border border-neutral-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
            {items.map((item) => {
              const itemPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
              const lineTotal = itemPrice * item.quantity;
              const hasIssue = validationResult?.issues.some(
                (iss) =>
                  iss.itemId === item.id ||
                  (iss.productId === item.productId &&
                    (iss.sizeId || null) === (item.sizeId || null))
              );

              return (
                <div
                  key={item.id || `${item.productId}_${item.sizeId || "nosize"}`}
                  className={cn(
                    "p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 transition-colors",
                    hasIssue && "bg-amber-50/40"
                  )}
                >
                  {/* Product Thumbnail */}
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName || "Product"}
                        fill
                        sizes="96px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.productSlug || item.productId}`}
                        className="text-sm sm:text-base font-medium text-neutral-900 hover:text-rose-600 transition-colors line-clamp-1"
                      >
                        {item.productName || "Handcrafted Creation"}
                      </Link>
                      <button
                        type="button"
                        onClick={() => item.id && removeItem(item.id)}
                        aria-label={`Remove ${item.productName || "item"} from bag`}
                        className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      {item.sku && <span>SKU: {item.sku}</span>}
                      {item.sku && item.sizeName && <span>•</span>}
                      {item.sizeName && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                          Size: {item.sizeName}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-neutral-600 pt-0.5">
                      Unit Price: <span className="font-medium text-neutral-900">{formatPrice(itemPrice)}</span>
                    </div>

                    {/* Quantity Selector & Line Total */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-neutral-300 rounded-lg bg-neutral-50">
                        <button
                          type="button"
                          onClick={() =>
                            item.id && updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity for ${item.productName || "item"}${item.sizeName ? `, size ${item.sizeName}` : ""}`}
                          className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-semibold text-neutral-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!item.id) return;
                            const sizeObj = item.product?.sizes?.find(
                              (s) => s.id === item.sizeId || s.name === item.sizeName
                            );
                            updateQuantity(item.id, item.quantity + 1, sizeObj?.stock);
                          }}
                          aria-label={`Increase quantity for ${item.productName || "item"}${item.sizeName ? `, size ${item.sizeName}` : ""}`}
                          className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-neutral-400 block">Total</span>
                        <span className="text-sm sm:text-base font-semibold text-neutral-950">
                          {formatPrice(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary & WhatsApp CTA (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl border border-neutral-200/80 bg-white space-y-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-serif text-neutral-900 tracking-tight border-b border-neutral-200/70 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Total Items</span>
                <span className="font-medium text-neutral-900">{itemCount}</span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-base font-semibold text-neutral-950">Subtotal</span>
                <span className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="text-xs text-neutral-500 font-light pt-1">
                Shipping and payment details will be confirmed on WhatsApp.
              </p>
            </div>

            {/* Explanatory Brand Note */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Atelier WhatsApp Ordering</span>
              </div>
              <p className="font-light leading-relaxed">
                We do not collect online payments or cards. Your bag details will be combined into a direct WhatsApp message to our stylists for sizing confirmation, shipping, and payment options.
              </p>
            </div>

            {/* Primary CTA: Order on WhatsApp */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isValidating || items.length === 0}
              onClick={handleOrderOnWhatsApp}
              className="w-full text-xs sm:text-sm uppercase tracking-wider font-semibold py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md bg-[#25D366] hover:bg-[#1da851] text-white transition-all focus:ring-2 focus:ring-[#25D366]/40 cursor-pointer"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating Stock...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Order on WhatsApp</span>
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-neutral-400 font-light">
              Orders confirmed via official WhatsApp at {siteConfig.whatsappNumberFormatted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
