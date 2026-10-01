"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./auth-provider";
import {
  getCartItems as firestoreGetCartItems,
  addToCart as firestoreAddToCart,
  updateCartQuantity as firestoreUpdateQuantity,
  removeFromCart as firestoreRemoveFromCart,
  clearUserCart as firestoreClearUserCart,
} from "@/services/cart";
import { getProductById } from "@/services/products";
import type { CartItem } from "@/types";

export interface AddCartItemInput {
  productId: string;
  sizeId?: string | null;
  sizeName?: string | null;
  quantity?: number;
  unitPrice?: number;
  productName?: string;
  productSlug?: string;
  sku?: string;
  image?: string;
  maxStock?: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (input: AddCartItemInput) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number, maxStock?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string, sizeId?: string | null) => boolean;
  getCartItemQuantity: (productId: string, sizeId?: string | null) => number;
  refreshCart: () => void;
  syncWithCurrentProducts: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_STORAGE_KEY = "ecom_guest_cart";

/**
 * Safely parses and normalizes guest cart items from localStorage.
 * Defends against string injections, corrupted JSON, NaN, and negative quantities.
 */
function parseGuestCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const normalized: CartItem[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        typeof item.productId === "string" &&
        item.productId.trim().length > 0
      ) {
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const cleanSizeId = typeof item.sizeId === "string" ? item.sizeId : null;
        const cleanSizeName = typeof item.sizeName === "string" ? item.sizeName : null;

        normalized.push({
          id: item.id || `guest_${item.productId}_${cleanSizeId || "standard"}`,
          userId: "guest",
          productId: item.productId,
          sizeId: cleanSizeId,
          sizeName: cleanSizeName,
          quantity: qty,
          unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : undefined,
          productName: typeof item.productName === "string" ? item.productName : undefined,
          productSlug: typeof item.productSlug === "string" ? item.productSlug : undefined,
          sku: typeof item.sku === "string" ? item.sku : undefined,
          image: typeof item.image === "string" ? item.image : undefined,
          createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
          updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
        });
      }
    }
    return normalized;
  } catch (error) {
    console.warn("[CartProvider] Malformed guest cart in localStorage. Resetting safely.", error);
    try {
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    } catch {
      // Ignore in non-browser envs
    }
    return [];
  }
}

function saveGuestCart(items: CartItem[]): void {
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("[CartProvider] Failed to persist guest cart in localStorage:", e);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const refreshCart = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Sync cart from Firestore (for logged-in user) or localStorage (for guests)
  useEffect(() => {
    let ignore = false;

    async function loadCart() {
      setIsLoading(true);
      try {
        if (user?.uid) {
          // Authenticated: load from Firestore
          const firestoreItems = await firestoreGetCartItems(user.uid);

          // Check if there is a pending guest cart in localStorage to merge
          let guestItems: CartItem[] = [];
          try {
            guestItems = parseGuestCart(localStorage.getItem(GUEST_CART_STORAGE_KEY));
          } catch {
            guestItems = [];
          }

          if (guestItems.length > 0) {
            // Deterministic merge of guest items into authenticated Firestore cart
            for (const gItem of guestItems) {
              const existing = firestoreItems.find(
                (f) =>
                  f.productId === gItem.productId &&
                  (f.sizeId || null) === (gItem.sizeId || null)
              );

              // Fetch live product to get accurate stock cap
              let liveStock = 999;
              try {
                const liveProd = await getProductById(gItem.productId);
                if (liveProd) {
                  if (liveProd.sizes && liveProd.sizes.length > 0) {
                    const sizeObj = liveProd.sizes.find(
                      (s) =>
                        s.id === gItem.sizeId ||
                        s.name === gItem.sizeName ||
                        s.name === gItem.sizeId
                    );
                    if (sizeObj) liveStock = sizeObj.stock;
                  } else {
                    liveStock = liveProd.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0) ?? 0;
                  }
                }
              } catch {
                liveStock = 999;
              }

              if (existing) {
                const mergedQty = Math.min(
                  existing.quantity + gItem.quantity,
                  Math.max(1, liveStock)
                );
                if (existing.id) {
                  await firestoreUpdateQuantity(existing.id, mergedQty, liveStock);
                  existing.quantity = mergedQty;
                }
              } else {
                const initialQty = Math.min(gItem.quantity, Math.max(1, liveStock));
                await firestoreAddToCart(user.uid, {
                  userId: user.uid,
                  productId: gItem.productId,
                  sizeId: gItem.sizeId || null,
                  sizeName: gItem.sizeName || null,
                  quantity: initialQty,
                  unitPrice: gItem.unitPrice,
                  productName: gItem.productName,
                  productSlug: gItem.productSlug,
                  sku: gItem.sku,
                  image: gItem.image,
                  maxStock: liveStock,
                });
              }
            }

            // Clear guest cart once merged
            try {
              localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            } catch {
              // Safe ignore
            }

            // Re-fetch clean merged items
            const mergedFirestoreItems = await firestoreGetCartItems(user.uid);
            if (!ignore) {
              setItems(mergedFirestoreItems);
            }
          } else {
            if (!ignore) {
              setItems(firestoreItems);
            }
          }
        } else {
          // Guest customer: load strictly from localStorage
          const local = parseGuestCart(localStorage.getItem(GUEST_CART_STORAGE_KEY));
          if (!ignore) {
            setItems(local);
          }
        }
      } catch (error) {
        console.error("[CartProvider] Error loading cart:", error);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      ignore = true;
    };
  }, [user, refreshTrigger]);

  // Synchronize items with authoritative product data (price & available stock)
  const syncWithCurrentProducts = useCallback(async () => {
    if (items.length === 0) return;
    try {
      const updatedList: CartItem[] = [];
      let hasChanges = false;

      for (const item of items) {
        const prod = await getProductById(item.productId);
        if (!prod || prod.status !== "published" || !prod.isPublished) {
          // Keep item but it will be flagged during checkout validation
          updatedList.push(item);
          continue;
        }

        const updatedItem = { ...item };
        if (prod.price !== item.unitPrice) {
          updatedItem.unitPrice = prod.price;
          hasChanges = true;
        }
        if (!item.productName && prod.name) {
          updatedItem.productName = prod.name;
          hasChanges = true;
        }
        if (!item.productSlug && prod.slug) {
          updatedItem.productSlug = prod.slug;
          hasChanges = true;
        }
        if (!item.sku && prod.sku) {
          updatedItem.sku = prod.sku;
          hasChanges = true;
        }
        if (!item.image && prod.images?.primary) {
          updatedItem.image = prod.images.primary;
          hasChanges = true;
        }

        updatedList.push(updatedItem);
      }

      if (hasChanges) {
        setItems(updatedList);
        if (!user?.uid) {
          saveGuestCart(updatedList);
        }
      }
    } catch (e) {
      console.error("[CartProvider] syncWithCurrentProducts error:", e);
    }
  }, [items, user]);

  // Remove item (declared before updateQuantity to avoid hoist/reference errors)
  const removeItem = useCallback(
    async (itemId: string): Promise<void> => {
      if (user?.uid) {
        try {
          await firestoreRemoveFromCart(itemId);
          setItems((prev) => prev.filter((i) => i.id !== itemId));
        } catch (error) {
          console.error("[CartProvider] Failed to remove Firestore cart item:", error);
        }
      } else {
        setItems((prev) => {
          const updated = prev.filter((i) => i.id !== itemId);
          saveGuestCart(updated);
          return updated;
        });
      }
    },
    [user]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number, maxStock?: number): Promise<void> => {
      let normalized = Math.floor(quantity);

      if (normalized <= 0) {
        await removeItem(itemId);
        return;
      }

      if (typeof maxStock === "number" && maxStock > 0) {
        normalized = Math.min(normalized, maxStock);
      }

      if (user?.uid) {
        // Authenticated: update in Firestore
        try {
          await firestoreUpdateQuantity(itemId, normalized, maxStock);
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity: normalized } : i))
          );
        } catch (error) {
          console.error("[CartProvider] Failed to update Firestore cart item:", error);
        }
      } else {
        // Guest: update in localStorage
        setItems((prev) => {
          const updated = prev.map((i) =>
            i.id === itemId ? { ...i, quantity: normalized } : i
          );
          saveGuestCart(updated);
          return updated;
        });
      }
    },
    [user, removeItem]
  );

  // Add Item to Bag
  const addItem = useCallback(
    async (input: AddCartItemInput): Promise<boolean> => {
      const cleanQuantity = Math.max(1, Math.floor(input.quantity || 1));
      const targetSizeId = input.sizeId || null;
      const targetSizeName = input.sizeName || null;

      // Bound quantity to maxStock if specified
      let boundedQuantity = cleanQuantity;
      if (typeof input.maxStock === "number" && input.maxStock > 0) {
        boundedQuantity = Math.min(boundedQuantity, input.maxStock);
      }

      if (user?.uid) {
        // Authenticated user: persist to Firestore
        try {
          await firestoreAddToCart(user.uid, {
            userId: user.uid,
            productId: input.productId,
            sizeId: targetSizeId,
            sizeName: targetSizeName,
            quantity: boundedQuantity,
            unitPrice: input.unitPrice,
            productName: input.productName,
            productSlug: input.productSlug,
            sku: input.sku,
            image: input.image,
            maxStock: input.maxStock,
          });
          // Refresh state from Firestore
          const refreshed = await firestoreGetCartItems(user.uid);
          setItems(refreshed);
          return true;
        } catch (error) {
          console.error("[CartProvider] Failed to add item to Firestore cart:", error);
          return false;
        }
      } else {
        // Guest user: update state and localStorage
        setItems((prev) => {
          const existingIndex = prev.findIndex(
            (i) =>
              i.productId === input.productId &&
              (i.sizeId || null) === targetSizeId
          );

          let updated: CartItem[];
          if (existingIndex > -1) {
            const existing = prev[existingIndex];
            if (!existing) return prev;
            let newQty = existing.quantity + boundedQuantity;
            if (typeof input.maxStock === "number" && input.maxStock > 0) {
              newQty = Math.min(newQty, input.maxStock);
            }

            const updatedItem: CartItem = {
              ...existing,
              quantity: newQty,
              sizeName: targetSizeName || existing.sizeName,
              unitPrice: input.unitPrice ?? existing.unitPrice,
              productName: input.productName ?? existing.productName,
              productSlug: input.productSlug ?? existing.productSlug,
              sku: input.sku ?? existing.sku,
              image: input.image ?? existing.image,
              updatedAt: new Date().toISOString(),
            };

            updated = [...prev];
            updated[existingIndex] = updatedItem;
          } else {
            const newItem: CartItem = {
              id: `guest_${input.productId}_${targetSizeId || "standard"}_${Date.now()}`,
              userId: "guest",
              productId: input.productId,
              sizeId: targetSizeId,
              sizeName: targetSizeName,
              quantity: boundedQuantity,
              unitPrice: input.unitPrice,
              productName: input.productName,
              productSlug: input.productSlug,
              sku: input.sku,
              image: input.image,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            updated = [...prev, newItem];
          }

          saveGuestCart(updated);
          return updated;
        });

        return true;
      }
    },
    [user]
  );

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<void> => {
    if (user?.uid) {
      try {
        await firestoreClearUserCart(user.uid);
        setItems([]);
      } catch (error) {
        console.error("[CartProvider] Failed to clear user cart:", error);
      }
    } else {
      setItems([]);
      try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  }, [user]);

  // Is product (+ optional size variant) in cart
  const isInCart = useCallback(
    (productId: string, sizeId?: string | null): boolean => {
      return items.some(
        (i) =>
          i.productId === productId &&
          (sizeId === undefined || (i.sizeId || null) === (sizeId || null))
      );
    },
    [items]
  );

  // Get current quantity of item in cart
  const getCartItemQuantity = useCallback(
    (productId: string, sizeId?: string | null): number => {
      const match = items.find(
        (i) =>
          i.productId === productId &&
          (sizeId === undefined || (i.sizeId || null) === (sizeId || null))
      );
      return match ? match.quantity : 0;
    },
    [items]
  );

  // Derived counts and totals
  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = typeof item.unitPrice === "number" ? item.unitPrice : 0;
      return total + price * (item.quantity || 0);
    }, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getCartItemQuantity,
        refreshCart,
        syncWithCurrentProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
