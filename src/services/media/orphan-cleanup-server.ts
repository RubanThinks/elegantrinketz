import { deleteDoc, doc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/server";
import { findOrphanMedia } from "./orphan-tracker";

const PENDING_MEDIA_COLLECTION = "pendingMedia";

/**
 * Clean up confirmed orphaned media assets older than the safety threshold.
 * Runs strictly in server environments (e.g., API routes or server background jobs).
 * Never deletes assets newer than the safety threshold (default: 24 hours).
 */
export async function cleanupOrphanMedia(
  olderThanHours = 24
): Promise<{ deletedCount: number; errors: string[] }> {
  const orphans = await findOrphanMedia(olderThanHours);
  let deletedCount = 0;
  const errors: string[] = [];
  const db = getFirebaseDb();

  for (const orphan of orphans) {
    try {
      const success = await deleteCloudinaryAsset(orphan.publicId);
      if (success) {
        const docId = encodeURIComponent(orphan.publicId);
        await deleteDoc(doc(db, PENDING_MEDIA_COLLECTION, docId));
        deletedCount++;
      } else {
        errors.push(`Could not delete asset ${orphan.publicId} from Cloudinary`);
      }
    } catch (err) {
      errors.push(`Error deleting ${orphan.publicId}: ${(err as Error).message}`);
    }
  }

  return { deletedCount, errors };
}
