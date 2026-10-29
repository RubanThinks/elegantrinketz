import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
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
      resellerProfile: data.resellerProfile || undefined,
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
 * Recursively removes undefined fields from an object or array to prevent Firestore update errors.
 */
function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedFields(item)) as unknown as T;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedFields(value);
      }
    }
    return cleaned as T;
  }
  return obj;
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
    resellerProfile?: UserProfile["resellerProfile"];
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
  if (allowedUpdates.resellerProfile !== undefined) {
    cleanPayload.resellerProfile = allowedUpdates.resellerProfile;
  }

  // Ensure no nested undefined fields are passed to Firestore
  const sanitized = removeUndefinedFields(cleanPayload);
  await updateDoc(userRef, sanitized as Record<string, unknown>);
}

/**
 * Fetch registered customers for admin order allocation.
 * Strict RBAC: only accessible by authenticated administrators.
 */
export async function getRegisteredCustomers(limitCount = 50): Promise<UserProfile[]> {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, USERS_COLLECTION), limit(limitCount));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
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
    });
  } catch (error) {
    console.error("[UsersService] Error fetching registered customers:", error);
    return [];
  }
}

/**
 * Find customer profile by email.
 */
export async function findCustomerByEmail(email: string): Promise<UserProfile | null> {
  if (!email || !email.trim()) return null;
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, USERS_COLLECTION),
      where("email", "==", email.trim().toLowerCase()),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty || !snap.docs[0]) return null;

    const docSnap = snap.docs[0];
    const data = docSnap.data();
    return {
      uid: docSnap.id,
      email: data.email || "",
      displayName: data.displayName || "",
      phone: data.phone || "",
      photoURL: data.photoURL || null,
      role: (data.role as UserRole) || "customer",
      isActive: data.isActive !== false,
      addresses: data.addresses || [],
      resellerProfile: data.resellerProfile || undefined,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("[UsersService] Error searching customer by email:", error);
    return null;
  }
}
