import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export interface PendingMediaRecord {
  publicId: string;
  url: string;
  uploadedBy?: string;
  uploadedAt: Timestamp | string;
  committed: boolean;
  entityId?: string;
  entityType?: "product" | "category" | "collection";
}

const PENDING_MEDIA_COLLECTION = "pendingMedia";

/**
 * Record a newly uploaded Cloudinary asset into pending tracking.
 */
export async function recordPendingMedia(
  publicId: string,
  url: string,
  uploadedBy?: string
): Promise<void> {
  if (!publicId) return;
  try {
    const db = getFirebaseDb();
    // Use encoded publicId as document ID
    const docId = encodeURIComponent(publicId);
    const mediaRef = doc(db, PENDING_MEDIA_COLLECTION, docId);

    await setDoc(mediaRef, {
      publicId,
      url,
      uploadedBy: uploadedBy || "admin",
      uploadedAt: serverTimestamp(),
      committed: false,
    });
  } catch (error) {
    console.warn("[OrphanTracker] Failed to record pending media:", error);
  }
}

/**
 * Mark media assets as committed when the parent entity is successfully saved.
 */
export async function commitMediaAssets(
  publicIds: string[],
  entityId: string,
  entityType: "product" | "category" | "collection"
): Promise<void> {
  if (!publicIds || publicIds.length === 0) return;
  try {
    const db = getFirebaseDb();
    for (const publicId of publicIds) {
      if (!publicId) continue;
      const docId = encodeURIComponent(publicId);
      const mediaRef = doc(db, PENDING_MEDIA_COLLECTION, docId);
      await setDoc(
        mediaRef,
        {
          publicId,
          committed: true,
          entityId,
          entityType,
          committedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn("[OrphanTracker] Failed to commit media assets:", error);
  }
}

/**
 * Identify orphaned Cloudinary media assets that are:
 * 1. Marked uncommitted in pendingMedia
 * 2. Older than the specified safety threshold (default: 24 hours)
 * 3. Not referenced in any Firestore product, category, or collection
 */
export async function findOrphanMedia(olderThanHours = 24): Promise<PendingMediaRecord[]> {
  try {
    const db = getFirebaseDb();
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

    const q = query(
      collection(db, PENDING_MEDIA_COLLECTION),
      where("committed", "==", false),
      where("uploadedAt", "<=", cutoffTimestamp)
    );

    const snap = await getDocs(q);
    if (snap.empty) return [];

    return snap.docs.map((d) => d.data() as PendingMediaRecord);
  } catch (error) {
    console.error("[OrphanTracker] Failed to find orphan media:", error);
    return [];
  }
}
