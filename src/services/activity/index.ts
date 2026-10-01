import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { AdminActivity } from "@/types";

const ACTIVITY_COLLECTION = "adminActivity";

/**
 * Log an administrative action to Firestore for audit trail and compliance.
 */
export async function logAdminActivity(
  activity: Omit<AdminActivity, "id" | "createdAt">
): Promise<string> {
  try {
    const db = getFirebaseDb();
    const docRef = await addDoc(collection(db, ACTIVITY_COLLECTION), {
      ...activity,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[ActivityService] Failed to record admin activity:", error);
    return "";
  }
}
