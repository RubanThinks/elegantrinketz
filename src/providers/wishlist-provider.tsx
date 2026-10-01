"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth-provider";
import {
  getWishlistItems,
  addToWishlist as firestoreAddToWishlist,
  removeFromWishlistByProduct,
} from "@/services/wishlist";

interface WishlistContextType {
  wishlistProductIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  wishlistCount: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_WISHLIST_KEY = "ecom_guest_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync wishlist from Firestore (for logged-in user) or localStorage (for guests)
  useEffect(() => {
    let ignore = false;

    async function loadWishlist() {
      setIsLoading(true);
      try {
        if (user?.uid) {
          // Logged in: fetch from Firestore
          const items = await getWishlistItems(user.uid);
          if (!ignore) {
            const firestoreIds = items.map((i) => i.productId);

            // If there were local guest wishlist items, sync them to Firestore
            const localSaved = localStorage.getItem(GUEST_WISHLIST_KEY);
            if (localSaved) {
              try {
                const guestIds: string[] = JSON.parse(localSaved);
                for (const gId of guestIds) {
                  if (!firestoreIds.includes(gId)) {
                    await firestoreAddToWishlist(user.uid, gId);
                    firestoreIds.push(gId);
                  }
                }
                localStorage.removeItem(GUEST_WISHLIST_KEY);
              } catch (e) {
                console.error("Failed to sync guest wishlist:", e);
              }
            }

            setWishlistProductIds(firestoreIds);
          }
        } else {
          // Guest: read from localStorage
          const localSaved = localStorage.getItem(GUEST_WISHLIST_KEY);
          if (!ignore) {
            if (localSaved) {
              try {
                setWishlistProductIds(JSON.parse(localSaved));
              } catch {
                setWishlistProductIds([]);
              }
            } else {
              setWishlistProductIds([]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading wishlist:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadWishlist();

    return () => {
      ignore = true;
    };
  }, [user?.uid]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistProductIds.includes(productId);
    },
    [wishlistProductIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      const alreadyIn = wishlistProductIds.includes(productId);
      const updated = alreadyIn
        ? wishlistProductIds.filter((id) => id !== productId)
        : [...wishlistProductIds, productId];

      // Optimistic update
      setWishlistProductIds(updated);

      try {
        if (user?.uid) {
          if (alreadyIn) {
            await removeFromWishlistByProduct(user.uid, productId);
          } else {
            await firestoreAddToWishlist(user.uid, productId);
          }
        } else {
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
        }
        return !alreadyIn;
      } catch (error) {
        // Revert on error
        console.error("Failed to toggle wishlist item:", error);
        setWishlistProductIds(wishlistProductIds);
        return alreadyIn;
      }
    },
    [user, wishlistProductIds]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const updated = wishlistProductIds.filter((id) => id !== productId);
      setWishlistProductIds(updated);

      try {
        if (user?.uid) {
          await removeFromWishlistByProduct(user.uid, productId);
        } else {
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
        }
      } catch (error) {
        console.error("Failed to remove wishlist item:", error);
        setWishlistProductIds(wishlistProductIds);
      }
    },
    [user, wishlistProductIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        wishlistCount: wishlistProductIds.length,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
