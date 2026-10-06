import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { ProductReview, CreateReviewInput } from "@/types";

const REVIEWS_COLLECTION = "productReviews";

function getLocalReviewsKey(productId: string): string {
  return `et_reviews_${productId}`;
}

function getLocalReviews(productId: string): ProductReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getLocalReviewsKey(productId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReview(review: ProductReview): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalReviews(review.productId);
    const updated = [review, ...current.filter((r) => r.id !== review.id)];
    localStorage.setItem(getLocalReviewsKey(review.productId), JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to persist review locally:", err);
  }
}

/**
 * Fetch all customer reviews for a given product.
 * Returns only real submitted reviews (never fake/simulated answers).
 */
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const localList = getLocalReviews(productId);

  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);

    const firestoreReviews: ProductReview[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      firestoreReviews.push({
        id: docSnap.id,
        productId: data.productId,
        productSlug: data.productSlug,
        authorName: data.authorName,
        authorCity: data.authorCity,
        rating: Number(data.rating) || 5,
        title: data.title,
        comment: data.comment,
        isVerifiedPurchase: Boolean(data.isVerifiedPurchase),
        helpfulCount: Number(data.helpfulCount) || 0,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() ||
          data.createdAt ||
          new Date().toISOString(),
      });
    });

    // Merge Firestore reviews and local reviews (avoiding duplicates)
    const map = new Map<string, ProductReview>();
    localList.forEach((r) => map.set(r.id, r));
    firestoreReviews.forEach((r) => map.set(r.id, r));

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    // If Firestore is offline or uninitialized, rely on local reviews
    return localList;
  }
}

/**
 * Submit a genuine customer review.
 */
export async function submitProductReview(
  input: CreateReviewInput
): Promise<ProductReview> {
  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: input.productId,
    productSlug: input.productSlug,
    authorName: input.authorName.trim(),
    authorCity: input.authorCity?.trim() || "Salem",
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    title: input.title.trim(),
    comment: input.comment.trim(),
    isVerifiedPurchase: true,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately cache locally for instant UI update
  saveLocalReview(newReview);

  // 2. Persist to Firestore if available
  try {
    const db = getFirebaseDb();
    await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...newReview,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("[ReviewsService] Could not persist review to Firestore, saved locally:", err);
  }

  return newReview;
}
