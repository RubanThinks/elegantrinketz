import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { CartItem } from "@/types";

const CART_COLLECTION = "cartItems";

export interface AddToCartInput {
  userId: string;
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

/**
 * Fetch all cart items belonging to a specific user.
 * Security enforcement: Security rules ensure a user can only read their own cart.
 */
export async function getCartItems(userId: string): Promise<CartItem[]> {
  if (!userId) return [];
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, CART_COLLECTION),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        productId: data.productId,
        sizeId: data.sizeId || null,
        sizeName: data.sizeName || null,
        quantity: Math.max(1, Math.floor(data.quantity || 1)),
        unitPrice: typeof data.unitPrice === "number" ? data.unitPrice : undefined,
        productName: data.productName || undefined,
        productSlug: data.productSlug || undefined,
        sku: data.sku || undefined,
        image: data.image || undefined,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("[CartService] Error fetching cart items:", error);
    return [];
  }
}

/**
 * Add a product to the user's cart or increment quantity if already exists.
 * If maxStock is provided, quantity will never exceed available stock.
 */
export async function addToCart(
  userId: string,
  productIdOrInput: string | AddToCartInput,
  sizeId?: string | null,
  quantity = 1
): Promise<string> {
  const db = getFirebaseDb();

  let input: AddToCartInput;
  if (typeof productIdOrInput === "string") {
    input = {
      userId,
      productId: productIdOrInput,
      sizeId: sizeId || null,
      quantity,
    };
  } else {
    input = productIdOrInput;
  }

  const cleanQuantity = Math.max(1, Math.floor(input.quantity || 1));
  const targetSizeId = input.sizeId || null;

  // Check if item already exists in cart for this user and size variant
  const q = query(
    collection(db, CART_COLLECTION),
    where("userId", "==", input.userId),
    where("productId", "==", input.productId),
    where("sizeId", "==", targetSizeId)
  );
  const existing = await getDocs(q);

  if (!existing.empty && existing.docs[0]) {
    // Increase quantity, capped at maxStock if specified
    const docSnap = existing.docs[0];
    const docId = docSnap.id;
    const currentQty = docSnap.data().quantity || 1;
    let targetQty = currentQty + cleanQuantity;

    if (typeof input.maxStock === "number" && input.maxStock > 0) {
      targetQty = Math.min(targetQty, input.maxStock);
    }

    await updateDoc(doc(db, CART_COLLECTION, docId), {
      quantity: targetQty,
      ...(input.sizeName ? { sizeName: input.sizeName } : {}),
      ...(input.unitPrice !== undefined ? { unitPrice: input.unitPrice } : {}),
      ...(input.productName ? { productName: input.productName } : {}),
      ...(input.productSlug ? { productSlug: input.productSlug } : {}),
      ...(input.sku ? { sku: input.sku } : {}),
      ...(input.image ? { image: input.image } : {}),
      updatedAt: serverTimestamp(),
    });
    return docId;
  }

  // Create new cart item
  let finalQty = cleanQuantity;
  if (typeof input.maxStock === "number" && input.maxStock > 0) {
    finalQty = Math.min(finalQty, input.maxStock);
  }

  const docRef = await addDoc(collection(db, CART_COLLECTION), {
    userId: input.userId,
    productId: input.productId,
    sizeId: targetSizeId,
    sizeName: input.sizeName || null,
    quantity: finalQty,
    ...(input.unitPrice !== undefined ? { unitPrice: input.unitPrice } : {}),
    ...(input.productName ? { productName: input.productName } : {}),
    ...(input.productSlug ? { productSlug: input.productSlug } : {}),
    ...(input.sku ? { sku: input.sku } : {}),
    ...(input.image ? { image: input.image } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update quantity of a cart item with stock capping.
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number,
  maxStock?: number
): Promise<void> {
  const db = getFirebaseDb();
  let normalizedQty = Math.floor(quantity);

  if (normalizedQty <= 0) {
    await deleteDoc(doc(db, CART_COLLECTION, cartItemId));
    return;
  }

  if (typeof maxStock === "number" && maxStock > 0) {
    normalizedQty = Math.min(normalizedQty, maxStock);
  }

  await updateDoc(doc(db, CART_COLLECTION, cartItemId), {
    quantity: normalizedQty,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove an item from the cart.
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, CART_COLLECTION, cartItemId));
}

/**
 * Clear all cart items for a specific user (e.g. manual clear cart).
 */
export async function clearUserCart(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, CART_COLLECTION),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("[CartService] Error clearing user cart:", error);
  }
}
