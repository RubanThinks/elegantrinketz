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
import type { Category } from "@/types";
import { demoCategories } from "@/lib/demo/categories";
import { USE_DEMO_DATA } from "@/lib/config/demo";
import { logAdminActivity } from "@/services/activity";

const CATEGORIES_COLLECTION = "categories";
const PRODUCTS_COLLECTION = "products";

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

/**
 * Fetch active categories from Firestore.
 * In production, returns only real Firestore documents (or empty array).
 * In development, returns demoCategories only if USE_DEMO_DATA is explicitly enabled.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where("isActive", "==", true)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const items = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Category[];
      return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
  } catch (error: any) {
    if (error?.code !== "permission-denied") {
      console.error("[CategoriesService] Firestore query error:", error);
    }
    if (!USE_DEMO_DATA) {
      return [];
    }
  }

  return USE_DEMO_DATA ? demoCategories : [];
}

/**
 * Fetch ALL categories (including inactive/archived) for Admin management.
 */
export async function getAllCategoriesAdmin(): Promise<Category[]> {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("sortOrder", "asc"));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Category[];
    }
  } catch (error) {
    console.error("[getAllCategoriesAdmin] Error:", error);
    if (!USE_DEMO_DATA) {
      return [];
    }
  }

  return USE_DEMO_DATA ? demoCategories : [];
}

/**
 * Fetch a single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where("slug", "==", slug),
      where("isActive", "==", true)
    );
    const snap = await getDocs(q);

    if (!snap.empty && snap.docs[0]) {
      return {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      } as Category;
    }
  } catch (error) {
    console.error("[CategoriesService] getCategoryBySlug error:", error);
    if (!USE_DEMO_DATA) {
      return null;
    }
  }

  return USE_DEMO_DATA ? (demoCategories.find((c) => c.slug === slug) || null) : null;
}

/**
 * Check if category slug is unique.
 */
export async function checkCategorySlugUnique(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  if (!slug) return false;
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
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

/**
 * Create a new category.
 */
export async function createCategory(
  categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
  adminId?: string
): Promise<string> {
  const db = getFirebaseDb();
  const slug = categoryData.slug?.trim().toLowerCase() || slugify(categoryData.name);

  const isUnique = await checkCategorySlugUnique(slug);
  if (!isUnique) {
    throw new Error(`Category slug "${slug}" already exists.`);
  }

  const catRef = doc(collection(db, CATEGORIES_COLLECTION));

  const payload = {
    ...categoryData,
    slug,
    isActive: categoryData.isActive !== false,
    sortOrder: categoryData.sortOrder || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(catRef, payload);

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "CREATE_CATEGORY",
      entityType: "category",
      entityId: catRef.id,
      description: `Created category "${categoryData.name}"`,
    });
  }

  return catRef.id;
}

/**
 * Update an existing category.
 */
export async function updateCategory(
  id: string,
  updates: Partial<Category>,
  adminId?: string
): Promise<void> {
  const db = getFirebaseDb();
  const catRef = doc(db, CATEGORIES_COLLECTION, id);

  if (updates.slug) {
    const isUnique = await checkCategorySlugUnique(updates.slug, id);
    if (!isUnique) {
      throw new Error(`Category slug "${updates.slug}" already exists.`);
    }
    updates.slug = updates.slug.trim().toLowerCase();
  }

  await updateDoc(catRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "UPDATE_CATEGORY",
      entityType: "category",
      entityId: id,
      description: `Updated category "${updates.name || id}"`,
    });
  }
}

/**
 * Delete a category with reference check.
 * Rejects deletion if products still belong to this category.
 */
export async function deleteCategory(id: string, adminId?: string): Promise<void> {
  const db = getFirebaseDb();

  // Guard: check if any products reference this category
  const q = query(collection(db, PRODUCTS_COLLECTION), where("categoryId", "==", id));
  const productSnap = await getDocs(q);

  if (!productSnap.empty) {
    throw new Error(
      `Cannot delete category: ${productSnap.docs.length} product(s) are currently assigned to it. Reassign those products first or deactivate the category.`
    );
  }

  await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "DELETE_CATEGORY",
      entityType: "category",
      entityId: id,
      description: `Deleted category ${id}`,
    });
  }
}
