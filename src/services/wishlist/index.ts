import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { WishlistItem } from "@/types";

const WISHLIST_COLLECTION = "wishlists";

/**
 * Fetch all wishlist items for a given user.
 */
export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  if (!userId) return [];
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, WISHLIST_COLLECTION),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        productId: data.productId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("[WishlistService] Error fetching wishlist items:", error);
    return [];
  }
}

/**
 * Check if a product is already in the user's wishlist.
 */
export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) return false;
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, WISHLIST_COLLECTION),
      where("userId", "==", userId),
      where("productId", "==", productId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}

/**
 * Add a product to the user's wishlist.
 */
export async function addToWishlist(userId: string, productId: string): Promise<string> {
  const db = getFirebaseDb();

  // If already exists, return existing ID
  const q = query(
    collection(db, WISHLIST_COLLECTION),
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  const existing = await getDocs(q);
  if (!existing.empty && existing.docs[0]) {
    return existing.docs[0].id;
  }

  const docRef = await addDoc(collection(db, WISHLIST_COLLECTION), {
    userId,
    productId,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Remove an item from the user's wishlist by wishlistItemId.
 */
export async function removeFromWishlist(wishlistItemId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, WISHLIST_COLLECTION, wishlistItemId));
}

/**
 * Remove an item from wishlist by userId and productId.
 */
export async function removeFromWishlistByProduct(userId: string, productId: string): Promise<void> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, WISHLIST_COLLECTION),
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  const snap = await getDocs(q);
  const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, WISHLIST_COLLECTION, d.id)));
  await Promise.all(deletePromises);
}
