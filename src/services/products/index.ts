import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  limit,
  orderBy,
  serverTimestamp,
  startAfter,
  runTransaction,
  DocumentSnapshot,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  Product,
  ProductCardData,
  ProductSize,
  ProductStatus,
  InventoryStatus,
  ProductMediaItem,
  ProductImages,
} from "@/types";
import { demoProducts } from "@/lib/demo/products";
import { USE_DEMO_DATA } from "@/lib/config/demo";
import { logAdminActivity } from "@/services/activity";
import { commitMediaAssets } from "@/services/media/orphan-tracker";

const PRODUCTS_COLLECTION = "products";
const SKU_REGISTRY_COLLECTION = "skuRegistry";
const SLUG_REGISTRY_COLLECTION = "slugRegistry";

export interface ProductQueryFilters {
  categoryId?: string;
  categorySlug?: string;
  collectionId?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isPublished?: boolean;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export interface AdminProductFilters {
  status?: ProductStatus | "all";
  inventoryStatus?: InventoryStatus | "all";
  categoryId?: string;
  collectionId?: string;
  search?: string;
  sortBy?: "createdAt" | "name" | "price" | "updatedAt";
  sortDirection?: "asc" | "desc";
  pageSize?: number;
  lastVisible?: DocumentSnapshot | null;
}

export interface AdminProductsResponse {
  products: Product[];
  total: number;
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Calculate total stock and inventory status for a product based on its size variants.
 * Guarantees integer stock quantities, preventing negative numbers or floating point errors.
 */
export function calculateProductInventory(sizes: ProductSize[]): {
  totalStock: number;
  isOutOfStock: boolean;
  inventoryStatus: InventoryStatus;
} {
  if (!sizes || sizes.length === 0) {
    return {
      totalStock: 0,
      isOutOfStock: true,
      inventoryStatus: "out_of_stock",
    };
  }

  const totalStock = sizes.reduce((sum, s) => {
    const qty = Math.max(0, Math.floor(Number(s.stock) || 0));
    return sum + qty;
  }, 0);

  const isOutOfStock = totalStock === 0;

  let inventoryStatus: InventoryStatus = "in_stock";
  if (totalStock === 0) {
    inventoryStatus = "out_of_stock";
  } else if (totalStock <= 3) {
    inventoryStatus = "low_stock";
  }

  return { totalStock, isOutOfStock, inventoryStatus };
}

/**
 * Adapter helper to transform full Product to ProductCardData format.
 * Guarantees primaryImage and hoverImage resolution for ProductCard.
 */
export function toProductCardData(product: Product): ProductCardData {
  const primaryImage =
    typeof product.images?.primary === "string" && product.images.primary.trim()
      ? product.images.primary
      : product.media?.find((m) => m.role === "primary")?.url || "";

  const hoverImage =
    typeof product.images?.hover === "string" && product.images.hover.trim()
      ? product.images.hover
      : product.media?.find((m) => m.role === "hover")?.url || undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    primaryImage,
    hoverImage: hoverImage || undefined,
    image: primaryImage,
    price: product.price,
    compareAtPrice: product.compareAtPrice || undefined,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isOutOfStock: product.isOutOfStock,
    href: `/products/${product.slug}`,
  };
}

/**
 * Generate a clean URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

/**
 * Enforce media items and role-specific images cannot drift into contradictory states:
 * - Exactly one logical primary image
 * - At most one hover image
 * - Remaining images assigned to gallery
 */
function normalizeMediaRoles(
  mediaItems: ProductMediaItem[],
  rawImages?: Partial<ProductImages> | DocumentData
) {
  let media = [...(mediaItems || [])];

  if (media.length > 0) {
    let primaryAssigned = false;
    let hoverAssigned = false;

    media = media.map((item) => {
      if (item.role === "primary") {
        if (!primaryAssigned) {
          primaryAssigned = true;
          return item;
        }
        return { ...item, role: "gallery" as const };
      }
      if (item.role === "hover") {
        if (!hoverAssigned) {
          hoverAssigned = true;
          return item;
        }
        return { ...item, role: "gallery" as const };
      }
      return item;
    });

    // If no primary exists, make first item primary
    if (!primaryAssigned && media.length > 0) {
      media[0] = { ...media[0], role: "primary" };
    }

    const primaryItem = media.find((m) => m.role === "primary");
    const hoverItem = media.find((m) => m.role === "hover");
    const galleryItems = media.filter((m) => m.role === "gallery");

    return {
      media,
      images: {
        primary: primaryItem ? primaryItem.url : media[0]?.url || "",
        hover: hoverItem ? hoverItem.url : null,
        gallery: galleryItems.map((g) => g.url),
        mediaItems: media,
      },
    };
  }

  // Fallback for legacy format
  const primary = typeof rawImages?.primary === "string" ? rawImages.primary : "";
  const hover = typeof rawImages?.hover === "string" ? rawImages.hover : null;
  const gallery: string[] = [];
  if (Array.isArray(rawImages?.gallery)) {
    rawImages.gallery.forEach((g: unknown) => {
      if (typeof g === "string" && g.trim()) gallery.push(g);
    });
  }

  return {
    media: [],
    images: {
      primary,
      hover,
      gallery,
      mediaItems: [],
    },
  };
}

/**
 * Normalize Firestore document data into a typed Product object.
 */
function normalizeProductDoc(id: string, data: DocumentData): Product {
  const rawSizes = (Array.isArray(data.sizes) ? data.sizes : []) as Array<Record<string, unknown>>;
  const sizes: ProductSize[] = rawSizes.map((s) => {
    const stock = Math.max(0, Math.floor(Number(s.stock) || 0));
    const name = String(s.name || "");
    return {
      id: String(s.id || name),
      name,
      stock,
      isAvailable: stock > 0,
    };
  });

  const { isOutOfStock } = calculateProductInventory(sizes);

  const rawImages = (data.images && typeof data.images === "object" ? data.images : {}) as DocumentData;
  const rawMedia: ProductMediaItem[] = (
    Array.isArray(data.media)
      ? data.media
      : Array.isArray(rawImages.mediaItems)
      ? rawImages.mediaItems
      : []
  ) as ProductMediaItem[];
  const { media, images } = normalizeMediaRoles(rawMedia, rawImages);

  const status: ProductStatus = (data.status as ProductStatus) || (data.isPublished ? "published" : "draft");

  return {
    id,
    name: String(data.name || ""),
    slug: String(data.slug || ""),
    description: String(data.description || ""),
    shortDescription: String(data.shortDescription || ""),
    sku: String(data.sku || "").toUpperCase(),
    price: Number(data.price) || 0,
    compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
    categoryId: String(data.categoryId || ""),
    categorySlug: String(data.categorySlug || ""),
    categoryName: String(data.categoryName || ""),
    collectionIds: (Array.isArray(data.collectionIds) ? data.collectionIds : []) as string[],
    images,
    media,
    sizes,
    tags: (Array.isArray(data.tags) ? data.tags : []) as string[],
    status,
    isPublished: status === "published",
    isNew: Boolean(data.isNew),
    isBestSeller: Boolean(data.isBestSeller),
    isFeatured: Boolean(data.isFeatured),
    isOutOfStock,
    seoTitle: String(data.seoTitle || ""),
    seoDescription: String(data.seoDescription || ""),
    createdAt: data.createdAt?.toDate?.()?.toISOString() || String(data.createdAt || new Date().toISOString()),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || String(data.updatedAt || new Date().toISOString()),
  };
}

/**
 * Fetch products for the public storefront with optional filtering.
 * In production: Never silently substitute demo products. An empty collection returns [].
 * In development: Uses demo products only if NEXT_PUBLIC_USE_DEMO_DATA=true.
 */
export async function getProducts(
  filters?: ProductQueryFilters
): Promise<ProductsResponse> {
  try {
    const db = getFirebaseDb();
    const constraints: ReturnType<typeof where>[] = [
      where("status", "==", "published"),
    ];

    if (filters?.categoryId) {
      constraints.push(where("categoryId", "==", filters.categoryId));
    }
    if (filters?.isFeatured !== undefined) {
      constraints.push(where("isFeatured", "==", filters.isFeatured));
    }
    if (filters?.isNew !== undefined) {
      constraints.push(where("isNew", "==", filters.isNew));
    }
    if (filters?.isBestSeller !== undefined) {
      constraints.push(where("isBestSeller", "==", filters.isBestSeller));
    }

    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      ...constraints,
      limit(filters?.limit || 24)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      let products = snapshot.docs.map((docSnap) =>
        normalizeProductDoc(docSnap.id, docSnap.data())
      );
      // Double guarantee public visibility
      products = products.filter(
        (p) => p.status === "published" && p.isPublished
      );
      if (filters?.categorySlug) {
        products = products.filter((p) => p.categorySlug === filters.categorySlug);
      }
      if (filters?.collectionId) {
        products = products.filter((p) => p.collectionIds?.includes(filters.collectionId!));
      }
      return { products, total: products.length };
    }
  } catch (error: any) {
    if (error?.code !== "permission-denied") {
      console.error("[ProductsService] Firestore query error:", error);
    }
    if (!USE_DEMO_DATA) {
      return { products: [], total: 0 };
    }
  }

  // Explicit development fallback only (never silently replace in production)
  if (USE_DEMO_DATA) {
    let result = [...demoProducts].filter((p) => p.status === "published" && p.isPublished);
    if (filters?.isFeatured) {
      result = result.filter((p) => p.isFeatured);
    }
    if (filters?.isNew) {
      result = result.filter((p) => p.isNew);
    }
    if (filters?.isBestSeller) {
      result = result.filter((p) => p.isBestSeller);
    }
    if (filters?.categoryId) {
      result = result.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters?.categorySlug) {
      result = result.filter((p) => p.categorySlug === filters.categorySlug);
    }
    if (filters?.collectionId) {
      result = result.filter((p) => p.collectionIds?.includes(filters.collectionId!));
    }
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    return { products: result, total: result.length };
  }

  return { products: [], total: 0 };
}

/**
 * Fetch a single product by slug from Firestore.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const cleanSlug = slug.trim().toLowerCase();
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("slug", "==", cleanSlug),
      where("status", "==", "published"),
      limit(1)
    );
    const snap = await getDocs(q);

    if (!snap.empty && snap.docs[0]) {
      const product = normalizeProductDoc(snap.docs[0].id, snap.docs[0].data());
      if (product.status === "published" && product.isPublished) {
        return product;
      }
    }
  } catch (error: any) {
    if (error?.code !== "permission-denied") {
      console.error("[ProductsService] getProductBySlug Firestore lookup error:", error);
    }
    if (!USE_DEMO_DATA) return null;
  }

  if (USE_DEMO_DATA) {
    return (
      demoProducts.find(
        (p) => p.slug === cleanSlug && p.status === "published" && p.isPublished
      ) || null
    );
  }

  return null;
}

/**
 * Fetch a single product by ID (used for admin and preview).
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return normalizeProductDoc(snap.id, snap.data());
    }
  } catch (error: any) {
    if (error?.code !== "permission-denied") {
      console.error("[ProductsService] getProductById Firestore lookup error:", error);
    }
    if (!USE_DEMO_DATA) return null;
  }

  if (USE_DEMO_DATA) {
    return demoProducts.find((p) => p.id === id) || null;
  }

  return null;
}

/**
 * Fetch featured products.
 */
export async function getFeaturedProducts(max = 8): Promise<Product[]> {
  const { products } = await getProducts({ isFeatured: true, limit: max });
  return products;
}

/**
 * Fetch multiple products by their document IDs (useful for wishlist & cart).
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];

  try {
    const uniqueIds = Array.from(new Set(ids));
    const productPromises = uniqueIds.map((id) => getProductById(id));
    const results = await Promise.all(productPromises);
    return results.filter((p): p is Product => p !== null && p.status === "published" && p.isPublished);
  } catch (error) {
    console.error("[ProductsService] getProductsByIds error:", error);
    return [];
  }
}

/**
 * Fetch related products sharing the same category.
 * Enforces published visibility, limits bounded to 4-8, excludes current product without N+1 queries.
 */
export async function getRelatedProducts(
  currentProductId: string,
  categoryId?: string,
  max = 4
): Promise<Product[]> {
  const boundedLimit = Math.min(Math.max(max, 4), 8);
  try {
    const { products } = await getProducts({
      categoryId: categoryId || undefined,
      limit: boundedLimit + 2,
    });
    return products
      .filter((p) => p.id !== currentProductId && p.status === "published" && p.isPublished)
      .slice(0, boundedLimit);
  } catch (error) {
    console.error("[ProductsService] getRelatedProducts error:", error);
    return [];
  }
}

/**
 * Verify whether a SKU is unique across all products.
 * Uses deterministic skuRegistry first, followed by direct product collection query.
 */
export async function checkSkuUnique(sku: string, excludeId?: string): Promise<boolean> {
  if (!sku || !sku.trim()) return false;
  const normalizedSku = sku.trim().toUpperCase();
  try {
    const db = getFirebaseDb();

    // 1. Check atomic registry
    const regRef = doc(db, SKU_REGISTRY_COLLECTION, normalizedSku);
    const regSnap = await getDoc(regRef);
    if (regSnap.exists()) {
      const regData = regSnap.data();
      if (!excludeId || regData.productId !== excludeId) {
        return false;
      }
    }

    // 2. Query products collection for secondary verification
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("sku", "==", normalizedSku)
    );
    const snap = await getDocs(q);

    if (snap.empty) return true;
    if (excludeId && snap.docs.length === 1 && snap.docs[0].id === excludeId) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("[checkSkuUnique] Error:", error);
    return false;
  }
}

/**
 * Verify whether a slug is unique across all products.
 * Uses deterministic slugRegistry first, followed by direct product collection query.
 */
export async function checkSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  if (!slug || !slug.trim()) return false;
  const normalizedSlug = slug.trim().toLowerCase();
  try {
    const db = getFirebaseDb();

    // 1. Check atomic registry
    const regRef = doc(db, SLUG_REGISTRY_COLLECTION, normalizedSlug);
    const regSnap = await getDoc(regRef);
    if (regSnap.exists()) {
      const regData = regSnap.data();
      if (!excludeId || regData.productId !== excludeId) {
        return false;
      }
    }

    // 2. Query products collection
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("slug", "==", normalizedSlug)
    );
    const snap = await getDocs(q);

    if (snap.empty) return true;
    if (excludeId && snap.docs.length === 1 && snap.docs[0].id === excludeId) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("[checkSlugUnique] Error:", error);
    return false;
  }
}

/**
 * Generate a unique slug by appending incremental numeric suffixes if duplicates exist.
 */
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let counter = 1;

  while (!(await checkSlugUnique(candidate, excludeId))) {
    candidate = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 50) break; // Circuit breaker
  }

  return candidate;
}

/**
 * Create a new product document in Firestore.
 * Atomic uniqueness for SKU and Slug backed by Firestore Transactions & Registry Documents.
 */
export async function createProduct(
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  adminId?: string
): Promise<string> {
  const db = getFirebaseDb();
  const sku = productData.sku.trim().toUpperCase();
  const slug = (productData.slug?.trim().toLowerCase() || slugify(productData.name)).replace(/[^a-z0-9-]/g, "");

  if (!sku) throw new Error("A valid SKU is required.");
  if (!slug) throw new Error("A valid slug is required.");

  // Clean sizes and derive inventory strictly with integers
  const cleanSizes: ProductSize[] = (productData.sizes || []).map((s) => {
    const stock = Math.max(0, Math.floor(Number(s.stock) || 0));
    return {
      id: s.id || s.name,
      name: s.name,
      stock,
      isAvailable: stock > 0,
    };
  });

  const { totalStock, isOutOfStock, inventoryStatus } = calculateProductInventory(cleanSizes);
  const status = productData.status || (productData.isPublished ? "published" : "draft");

  if (status === "published") {
    if (!productData.categoryId) {
      throw new Error("Product cannot be published without an assigned category.");
    }
    if (cleanSizes.length === 0) {
      throw new Error("Product cannot be published without at least one size variant.");
    }
  }

  // Media normalization
  const rawImages = productData.images || {};
  const rawMedia = productData.media || rawImages.mediaItems || [];
  const { media, images } = normalizeMediaRoles(rawMedia, rawImages);

  const productRef = doc(collection(db, PRODUCTS_COLLECTION));
  const skuRegRef = doc(db, SKU_REGISTRY_COLLECTION, sku);
  const slugRegRef = doc(db, SLUG_REGISTRY_COLLECTION, slug);

  // Atomic transaction reserving SKU and slug
  await runTransaction(db, async (tx) => {
    const [skuSnap, slugSnap] = await Promise.all([
      tx.get(skuRegRef),
      tx.get(slugRegRef),
    ]);

    if (skuSnap.exists() && skuSnap.data().productId !== productRef.id) {
      throw new Error(`SKU "${sku}" is already in use by another product.`);
    }
    if (slugSnap.exists() && slugSnap.data().productId !== productRef.id) {
      throw new Error(`Slug "${slug}" is already in use. Please select a different title or slug.`);
    }

    const payload = {
      ...productData,
      sku,
      slug,
      sizes: cleanSizes,
      totalStock,
      inventoryStatus,
      isOutOfStock,
      status,
      isPublished: status === "published",
      images,
      media,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    tx.set(skuRegRef, { productId: productRef.id, sku, updatedAt: serverTimestamp() });
    tx.set(slugRegRef, { productId: productRef.id, slug, updatedAt: serverTimestamp() });
    tx.set(productRef, payload);
  });

  // Commit uploaded assets in orphan tracker
  if (media.length > 0) {
    commitMediaAssets(media.map((m) => m.publicId).filter(Boolean), productRef.id, "product").catch(() => {});
  }

  // Record audit log
  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "CREATE_PRODUCT",
      entityType: "product",
      entityId: productRef.id,
      description: `Created product "${productData.name}" (${sku}) with status ${status}`,
    });
  }

  return productRef.id;
}

/**
 * Update an existing product document.
 * Safely releases and updates SKU / Slug reservations atomically.
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>,
  adminId?: string
): Promise<void> {
  const db = getFirebaseDb();
  const productRef = doc(db, PRODUCTS_COLLECTION, id);

  await runTransaction(db, async (tx) => {
    const existingSnap = await tx.get(productRef);
    if (!existingSnap.exists()) {
      throw new Error(`Product ${id} not found.`);
    }
    const currentData = existingSnap.data();

    const newSku = updates.sku ? updates.sku.trim().toUpperCase() : undefined;
    const newSlug = updates.slug ? updates.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") : undefined;

    // Handle SKU change reservation
    if (newSku && newSku !== currentData.sku) {
      const newSkuRef = doc(db, SKU_REGISTRY_COLLECTION, newSku);
      const skuSnap = await tx.get(newSkuRef);
      if (skuSnap.exists() && skuSnap.data().productId !== id) {
        throw new Error(`SKU "${newSku}" is already in use by another product.`);
      }
      tx.set(newSkuRef, { productId: id, sku: newSku, updatedAt: serverTimestamp() });
      if (currentData.sku) {
        tx.delete(doc(db, SKU_REGISTRY_COLLECTION, currentData.sku));
      }
    }

    // Handle slug change reservation
    if (newSlug && newSlug !== currentData.slug) {
      const newSlugRef = doc(db, SLUG_REGISTRY_COLLECTION, newSlug);
      const slugSnap = await tx.get(newSlugRef);
      if (slugSnap.exists() && slugSnap.data().productId !== id) {
        throw new Error(`Slug "${newSlug}" is already in use.`);
      }
      tx.set(newSlugRef, { productId: id, slug: newSlug, updatedAt: serverTimestamp() });
      if (currentData.slug) {
        tx.delete(doc(db, SLUG_REGISTRY_COLLECTION, currentData.slug));
      }
    }

    const payload: Record<string, unknown> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (newSku) payload.sku = newSku;
    if (newSlug) payload.slug = newSlug;

    // Clean sizes if present and recalculate inventory
    if (updates.sizes) {
      const cleanSizes: ProductSize[] = updates.sizes.map((s) => {
        const stock = Math.max(0, Math.floor(Number(s.stock) || 0));
        return {
          id: s.id || s.name,
          name: s.name,
          stock,
          isAvailable: stock > 0,
        };
      });
      const { totalStock, isOutOfStock, inventoryStatus } = calculateProductInventory(cleanSizes);
      payload.sizes = cleanSizes;
      payload.totalStock = totalStock;
      payload.isOutOfStock = isOutOfStock;
      payload.inventoryStatus = inventoryStatus;
    }

    // Normalize media if present
    if (updates.media || updates.images?.mediaItems) {
      const rawMedia = updates.media || updates.images?.mediaItems || [];
      const { media, images } = normalizeMediaRoles(rawMedia, updates.images);
      payload.media = media;
      payload.images = images;
    }

    // Keep isPublished synchronized with status
    if (updates.status) {
      payload.isPublished = updates.status === "published";
    }

    tx.update(productRef, payload);
  });

  if (updates.media && updates.media.length > 0) {
    commitMediaAssets(updates.media.map((m) => m.publicId).filter(Boolean), id, "product").catch(() => {});
  }

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "UPDATE_PRODUCT",
      entityType: "product",
      entityId: id,
      description: `Updated product ${id} (${updates.name || "field updates"})`,
    });
  }
}

/**
 * Archive a product without hard deletion to preserve historical orders.
 */
export async function archiveProduct(id: string, adminId?: string): Promise<void> {
  await updateProduct(
    id,
    {
      status: "archived",
      isPublished: false,
    },
    adminId
  );
}

/**
 * Publish a product with strict verification of all required fields.
 */
export async function publishProduct(id: string, adminId?: string): Promise<void> {
  const product = await getProductById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.name || !product.name.trim()) {
    throw new Error("Product cannot be published: Title is required.");
  }

  if (!product.sku || !product.sku.trim()) {
    throw new Error("Product cannot be published: SKU is required.");
  }

  if (!product.slug || !product.slug.trim()) {
    throw new Error("Product cannot be published: URL slug is required.");
  }

  if (typeof product.price !== "number" || isNaN(product.price) || product.price <= 0) {
    throw new Error("Product cannot be published: A valid price greater than zero is required.");
  }

  if (!product.images?.primary || !product.images.primary.trim()) {
    throw new Error("Product cannot be published without a primary product image.");
  }

  if (!product.categoryId) {
    throw new Error("Product cannot be published without an assigned category.");
  }

  if (!product.sizes || product.sizes.length === 0) {
    throw new Error("Product cannot be published without at least one size variant.");
  }

  await updateProduct(
    id,
    {
      status: "published",
      isPublished: true,
    },
    adminId
  );
}

/**
 * Unpublish a product back to draft status.
 */
export async function unpublishProduct(id: string, adminId?: string): Promise<void> {
  await updateProduct(
    id,
    {
      status: "draft",
      isPublished: false,
    },
    adminId
  );
}

/**
 * Hard delete a product (only for super_admin with confirmation).
 * Releases SKU and Slug registry reservations.
 */
export async function deleteProduct(id: string, adminId?: string): Promise<void> {
  const db = getFirebaseDb();
  const productRef = doc(db, PRODUCTS_COLLECTION, id);

  const snap = await getDoc(productRef);
  if (snap.exists()) {
    const data = snap.data();
    if (data.sku) {
      await deleteDoc(doc(db, SKU_REGISTRY_COLLECTION, data.sku)).catch(() => {});
    }
    if (data.slug) {
      await deleteDoc(doc(db, SLUG_REGISTRY_COLLECTION, data.slug)).catch(() => {});
    }
  }

  await deleteDoc(productRef);

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "DELETE_PRODUCT",
      entityType: "product",
      entityId: id,
      description: `Permanently deleted product ${id}`,
    });
  }
}

/**
 * Update stock inventory for a product's size variants.
 * Strictly sanitizes quantities to non-negative integers.
 */
export async function updateProductInventory(
  productId: string,
  sizes: ProductSize[],
  adminId?: string
): Promise<void> {
  const cleanSizes: ProductSize[] = sizes.map((s) => {
    const stock = Math.max(0, Math.floor(Number(s.stock) || 0));
    return {
      id: s.id || s.name,
      name: s.name,
      stock,
      isAvailable: stock > 0,
    };
  });

  const { totalStock, isOutOfStock, inventoryStatus } = calculateProductInventory(cleanSizes);

  const db = getFirebaseDb();
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);

  await updateDoc(productRef, {
    sizes: cleanSizes,
    totalStock,
    isOutOfStock,
    inventoryStatus,
    updatedAt: serverTimestamp(),
  });

  if (adminId) {
    await logAdminActivity({
      adminId,
      action: "UPDATE_INVENTORY",
      entityType: "product",
      entityId: productId,
      description: `Updated stock variants for product ${productId} (Total: ${totalStock}, Status: ${inventoryStatus})`,
    });
  }
}

/**
 * Fetch products for the Admin Management Dashboard with comprehensive filters.
 * Returns only real Firestore products. In development, demo fallback applies only if explicitly enabled.
 */
export async function getAdminProducts(
  params: AdminProductFilters = {}
): Promise<AdminProductsResponse> {
  const db = getFirebaseDb();
  const pageSize = params.pageSize || 30;

  try {
    const constraints: QueryConstraint[] = [];

    // Filter by status if specified
    if (params.status && params.status !== "all") {
      constraints.push(where("status", "==", params.status));
    }

    // Filter by category if specified
    if (params.categoryId && params.categoryId !== "all") {
      constraints.push(where("categoryId", "==", params.categoryId));
    }

    const sortField = params.sortBy || "createdAt";
    const sortDirection = params.sortDirection || "desc";
    constraints.push(orderBy(sortField, sortDirection));

    if (params.lastVisible) {
      constraints.push(startAfter(params.lastVisible));
    }

    constraints.push(limit(pageSize));

    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const snap = await getDocs(q);

    if (!snap.empty) {
      let products = snap.docs.map((d) => normalizeProductDoc(d.id, d.data()));

      // Client-side text search filter if provided
      if (params.search && params.search.trim()) {
        const term = params.search.toLowerCase().trim();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.sku.toLowerCase().includes(term) ||
            p.slug.toLowerCase().includes(term)
        );
      }

      // Client-side inventory state filter
      if (params.inventoryStatus && params.inventoryStatus !== "all") {
        products = products.filter((p) => {
          const { inventoryStatus } = calculateProductInventory(p.sizes);
          return inventoryStatus === params.inventoryStatus;
        });
      }

      const lastDoc = snap.docs[snap.docs.length - 1] || null;

      return {
        products,
        total: products.length,
        lastVisible: lastDoc,
        hasMore: snap.docs.length === pageSize,
      };
    }
  } catch (error) {
    console.error("[getAdminProducts] Error loading products:", error);
    if (!USE_DEMO_DATA) {
      return {
        products: [],
        total: 0,
        lastVisible: null,
        hasMore: false,
      };
    }
  }

  // Fallback to demo products ONLY in development if explicitly enabled
  if (USE_DEMO_DATA) {
    let fallback = [...demoProducts];
    if (params.search) {
      const term = params.search.toLowerCase().trim();
      fallback = fallback.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term)
      );
    }

    return {
      products: fallback,
      total: fallback.length,
      lastVisible: null,
      hasMore: false,
    };
  }

  return {
    products: [],
    total: 0,
    lastVisible: null,
    hasMore: false,
  };
}
