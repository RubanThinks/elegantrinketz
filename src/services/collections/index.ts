import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Collection } from "@/types";
import { logAdminActivity } from "@/services/activity";

const COLLECTIONS_COLLECTION = "collections";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

const fallbackCollections: Collection[] = [
  {
    id: "col-new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "The latest curated additions to our seasonal wardrobe.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "col-festive-edit",
    name: "Festive Edit",
    slug: "festive-edit",
    description: "Grand celebratory ensembles rich with zari and embroidery.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "col-best-sellers",
    name: "Best Sellers",
    slug: "best-sellers",
    description: "Our most coveted, highest-rated wardrobe favorites.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "col-wedding-season",
    name: "Wedding Season",
    slug: "wedding-season",
    description: "Opulent lehengas and regal heritage Banarasi drapes.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

import { USE_DEMO_DATA } from "@/lib/config/demo";

export async function getCollections(): Promise<Collection[]> {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTIONS_COLLECTION),
      where("isActive", "==", true)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const items = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Collection[];
      return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
  } catch (error: any) {
    if (error?.code !== "permission-denied") {
      console.error("[CollectionsService] Firestore query error:", error);
    }
    if (!USE_DEMO_DATA) {
      return [];
    }
  }

  return USE_DEMO_DATA ? fallbackCollections : [];
}

export async function getAllCollectionsAdmin(): Promise<Collection[]> {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, COLLECTIONS_COLLECTION), orderBy("sortOrder", "asc"));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Collection[];
    }
  } catch (error) {
    console.error("[getAllCollectionsAdmin] Error:", error);
    if (!USE_DEMO_DATA) {
      return [];
    }
  }

  return USE_DEMO_DATA ? fallbackCollections : [];
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTIONS_COLLECTION),
      where("slug", "==", slug),
      where("isActive", "==", true)
    );
    const snap = await getDocs(q);

    if (!snap.empty && snap.docs[0]) {
      return {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      } as Collection;
    }
  } catch (error) {
    console.error("[CollectionsService] getCollectionBySlug Firestore query error:", error);
    if (!USE_DEMO_DATA) {
      return null;
    }
  }

  return USE_DEMO_DATA ? (fallbackCollections.find((c) => c.slug === slug) || null) : null;
}

export async function checkCollectionSlugUnique(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  if (!slug) return false;
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTIONS_COLLECTION),
      where("slug", "==", slug.trim().toLowerCase())
    );
    const snap = await getDocs(q);

    if (snap.empty) return true;
    if (excludeId && snap.docs.length === 1 && snap.docs[0].id === excludeId) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export async function createCollection(
  collectionData: Omit<Collection, "id" | "createdAt" | "updatedAt">,
  adminId?: string
): Promise<string> {
  const db = getFirebaseDb();
  const slug = collectionData.slug?.trim().toLowerCase() || slugify(collectionData.name);

  const isUnique = await checkCollectionSlugUnique(slug);
  if (!isUnique) {
    throw new Error(`Collection slug "${slug}" already exists.`);
  }

  const colRef = doc(collection(db, COLLECTIONS_COLLECTION));

  const payload = {
    ...collectionData,
    slug,
    isActive: collectionData.isActive !== false,
    sortOrder: collectionData.sortOrder || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(colRef, payload);

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "CREATE_COLLECTION",
      entityType: "collection",
      entityId: colRef.id,
      description: `Created collection "${collectionData.name}"`,
    });
  }

  return colRef.id;
}

export async function updateCollection(
  id: string,
  updates: Partial<Collection>,
  adminId?: string
): Promise<void> {
  const db = getFirebaseDb();
  const colRef = doc(db, COLLECTIONS_COLLECTION, id);

  if (updates.slug) {
    const isUnique = await checkCollectionSlugUnique(updates.slug, id);
    if (!isUnique) {
      throw new Error(`Collection slug "${updates.slug}" already exists.`);
    }
    updates.slug = updates.slug.trim().toLowerCase();
  }

  await updateDoc(colRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "UPDATE_COLLECTION",
      entityType: "collection",
      entityId: id,
      description: `Updated collection "${updates.name || id}"`,
    });
  }
}

export async function deleteCollection(id: string, adminId?: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, COLLECTIONS_COLLECTION, id));

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "DELETE_COLLECTION",
      entityType: "collection",
      entityId: id,
      description: `Deleted collection ${id}`,
    });
  }
}
