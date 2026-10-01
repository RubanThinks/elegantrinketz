import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { UserProfile, UserRole } from "@/types";

const USERS_COLLECTION = "users";

/**
 * Fetch a user profile by Firebase Auth UID from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    return {
      uid,
      email: data.email || "",
      displayName: data.displayName || "",
      phone: data.phone || "",
      photoURL: data.photoURL || null,
      role: (data.role as UserRole) || "customer",
      isActive: data.isActive !== false,
      addresses: data.addresses || [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("[UsersService] Error fetching user profile:", error);
    return null;
  }
}

/**
 * Create a new customer profile in Firestore upon registration.
 *
 * CRITICAL SECURITY PRINCIPLE:
 * Default role is ALWAYS forced to "customer".
 * The client browser can NEVER specify "admin" or "super_admin".
 */
export async function createUserProfile(
  uid: string,
  params: {
    email: string;
    displayName: string;
    phone?: string;
    photoURL?: string | null;
  }
): Promise<UserProfile> {
  const db = getFirebaseDb();
  const userRef = doc(db, USERS_COLLECTION, uid);

  const newProfile: Omit<UserProfile, "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid,
    email: params.email.toLowerCase().trim(),
    displayName: params.displayName.trim(),
    phone: params.phone?.trim() || "",
    photoURL: params.photoURL || null,
    role: "customer", // FORCED DEFAULT ROLE
    isActive: true,
    addresses: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, newProfile);

  return {
    uid,
    email: newProfile.email,
    displayName: newProfile.displayName,
    phone: newProfile.phone,
    photoURL: newProfile.photoURL,
    role: "customer",
    isActive: true,
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Synchronize Google-authenticated user to Firestore.
 * If document doesn't exist, create it as customer.
 * If it does exist, return existing profile without overriding customer data.
 */
export async function syncGoogleUserProfile(firebaseUser: User): Promise<UserProfile> {
  const existing = await getUserProfile(firebaseUser.uid);
  if (existing) {
    // Document exists - return profile (role and permissions preserved)
    return existing;
  }

  // First time Google sign-in: create customer record
  return createUserProfile(firebaseUser.uid, {
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "Valued Shopper",
    photoURL: firebaseUser.photoURL || null,
  });
}

/**
 * Update allowed customer profile fields.
 * Explicitly rejects client-side attempts to modify role or isActive status.
 */
export async function updateUserProfile(
  uid: string,
  allowedUpdates: {
    displayName?: string;
    phone?: string;
    photoURL?: string | null;
    addresses?: UserProfile["addresses"];
  }
): Promise<void> {
  const db = getFirebaseDb();
  const userRef = doc(db, USERS_COLLECTION, uid);

  // Strip any disallowed keys to ensure security integrity
  const cleanPayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (allowedUpdates.displayName !== undefined) {
    cleanPayload.displayName = allowedUpdates.displayName.trim();
  }
  if (allowedUpdates.phone !== undefined) {
    cleanPayload.phone = allowedUpdates.phone.trim();
  }
  if (allowedUpdates.photoURL !== undefined) {
    cleanPayload.photoURL = allowedUpdates.photoURL;
  }
  if (allowedUpdates.addresses !== undefined) {
    cleanPayload.addresses = allowedUpdates.addresses;
  }

  await updateDoc(userRef, cleanPayload);
}
