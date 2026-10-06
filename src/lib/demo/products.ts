import type { Product, ProductCardData, ProductSize } from "@/types";

const defaultSizes: ProductSize[] = [
  { id: "S", name: "S", stock: 12, isAvailable: true },
  { id: "M", name: "M", stock: 8, isAvailable: true },
  { id: "L", name: "L", stock: 6, isAvailable: true },
  { id: "XL", name: "XL", stock: 4, isAvailable: true },
  { id: "XXL", name: "XXL", stock: 2, isAvailable: true },
];

const freeSizes: ProductSize[] = [
  { id: "FREE", name: "Free Size (Stretch)", stock: 20, isAvailable: true },
];

const pantSizes: ProductSize[] = [
  { id: "28", name: "28 (S)", stock: 10, isAvailable: true },
  { id: "30", name: "30 (M)", stock: 15, isAvailable: true },
  { id: "32", name: "32 (L)", stock: 12, isAvailable: true },
  { id: "34", name: "34 (XL)", stock: 8, isAvailable: true },
  { id: "36", name: "36 (XXL)", stock: 5, isAvailable: true },
];

/**
 * DEMO PRODUCTS DATA FOR ELEGANT _TRINKETZ
 * Prominent product categories:
 * - Side Cut Kurtis
 * - Umbrella Kurtis
 * - 3 Piece Sets
 * - Straight Pants
 * - Shimmer Leggings
 * - Ethnic & Festive Wear
 * - Accessories (Trinketz)
 */
export const demoProducts: Product[] = [
  {
    id: "prod-1",
    name: "Floral Printed Side Cut Kurti",
    slug: "floral-printed-side-cut-kurti",
    description:
      "Crafted from premium breathable rayon-cotton with stylish side slits and delicate potli button accents. Perfect for pairing with straight pants or shimmer leggings.",
    price: 1199,
    compareAtPrice: 1599,
    images: {
      primary: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-side-cut-kurtis",
    categorySlug: "side-cut-kurtis",
    collectionIds: ["new-arrivals", "best-sellers"],
    tags: ["Side Cut Kurti", "Rayon", "Floral", "Casual Chic"],
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-SCK-001",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "prod-2",
    name: "Embroidered Rayon Side Cut Kurti",
    slug: "embroidered-rayon-side-cut-kurti",
    description:
      "Contemporary side cut kurti featuring intricate threadwork embroidery across the yoke and cuffs with high side slits for effortless grace.",
    price: 1399,
    compareAtPrice: 1899,
    images: {
      primary: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-side-cut-kurtis",
    categorySlug: "side-cut-kurtis",
    collectionIds: ["new-arrivals"],
    tags: ["Side Cut Kurti", "Embroidery", "Festive", "Elegant"],
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-SCK-002",
    createdAt: "2026-01-12T00:00:00Z",
    updatedAt: "2026-01-12T00:00:00Z",
  },
  {
    id: "prod-3",
    name: "Flared Umbrella Cut Anarkali Kurti",
    slug: "flared-umbrella-cut-anarkali-kurti",
    description:
      "Dramatic 3.5-meter circular flare umbrella cut kurti in soft mulmul cotton with gold foil printing and festive border hem.",
    price: 1599,
    compareAtPrice: 2199,
    images: {
      primary: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-umbrella-kurtis",
    categorySlug: "umbrella-kurtis",
    collectionIds: ["best-sellers", "festive-edit"],
    tags: ["Umbrella Kurti", "Flared", "Anarkali", "Festive"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-UMB-003",
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: "2026-01-05T00:00:00Z",
  },
  {
    id: "prod-4",
    name: "Indigo Block Print Umbrella Kurti",
    slug: "indigo-block-print-umbrella-kurti",
    description:
      "Traditional indigo hand-block inspired motifs on a flowing umbrella silhouette. Lightweight, elegant, and versatile for everyday festive wear.",
    price: 1299,
    compareAtPrice: 1749,
    images: {
      primary: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-umbrella-kurtis",
    categorySlug: "umbrella-kurtis",
    collectionIds: ["new-arrivals"],
    tags: ["Umbrella Kurti", "Indigo", "Cotton", "Daily Wear"],
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-UMB-004",
    createdAt: "2026-01-08T00:00:00Z",
    updatedAt: "2026-01-08T00:00:00Z",
  },
  {
    id: "prod-5",
    name: "Festive Chanderi 3 Piece Set (Kurti, Pant & Dupatta)",
    slug: "festive-chanderi-3-piece-set",
    description:
      "Complete 3-piece designer set featuring a fine chanderi silk kurti with zari work, tailored straight pants, and a matching organza dupatta.",
    price: 2499,
    compareAtPrice: 3299,
    images: {
      primary: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-three-piece-sets",
    categorySlug: "three-piece-sets",
    collectionIds: ["best-sellers", "festive-edit", "new-arrivals"],
    tags: ["3 Piece Set", "Chanderi", "Dupatta", "Straight Pant", "Festive"],
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-3PS-005",
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  },
  {
    id: "prod-6",
    name: "Pastel Embroidered 3 Piece Suit Set",
    slug: "pastel-embroidered-3-piece-suit-set",
    description:
      "Sophisticated 3-piece set comprising straight cut embroidered kurta, comfortable flex cigarette pant, and lightweight printed chiffon dupatta.",
    price: 2199,
    compareAtPrice: 2899,
    images: {
      primary: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-three-piece-sets",
    categorySlug: "three-piece-sets",
    collectionIds: ["best-sellers"],
    tags: ["3 Piece Set", "Pastel", "Embroidery", "Wedding Edit"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-3PS-006",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "prod-7",
    name: "Classic Cotton Straight Pants with Pockets",
    slug: "classic-cotton-straight-pants",
    description:
      "Ultra-comfortable premium 100% cotton straight pants featuring an elasticated waistband with drawstring, side pocket, and ankle slit detail.",
    price: 699,
    compareAtPrice: 999,
    images: {
      primary: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: pantSizes,
    categoryId: "cat-straight-pants",
    categorySlug: "straight-pants",
    collectionIds: ["best-sellers"],
    tags: ["Straight Pants", "Cotton", "Bottom Wear", "Essentials"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-STP-007",
    createdAt: "2026-01-04T00:00:00Z",
    updatedAt: "2026-01-04T00:00:00Z",
  },
  {
    id: "prod-8",
    name: "Silk Blend Straight Fit Cigarette Pants",
    slug: "silk-blend-straight-fit-pants",
    description:
      "Polished raw-silk blend straight pants with subtle sheen, side zip closure, and comfortable inner lining for pairing with festive kurtis.",
    price: 899,
    compareAtPrice: 1299,
    images: {
      primary: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: pantSizes,
    categoryId: "cat-straight-pants",
    categorySlug: "straight-pants",
    collectionIds: ["new-arrivals"],
    tags: ["Straight Pants", "Silk", "Festive Bottom", "Cigarette Pant"],
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-STP-008",
    createdAt: "2026-01-11T00:00:00Z",
    updatedAt: "2026-01-11T00:00:00Z",
  },
  {
    id: "prod-9",
    name: "Golden Luster Shimmer Leggings",
    slug: "golden-luster-shimmer-leggings",
    description:
      "High-stretch 4-way lycra shimmer leggings with metallic gold shimmer. Soft non-scratchy waistband designed to pair with umbrella kurtis and anarkalis.",
    price: 549,
    compareAtPrice: 799,
    images: {
      primary: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: freeSizes,
    categoryId: "cat-shimmer-leggings",
    categorySlug: "shimmer-leggings",
    collectionIds: ["best-sellers", "festive-edit"],
    tags: ["Shimmer Leggings", "Gold", "Metallic", "Stretch"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-SHL-009",
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-03T00:00:00Z",
  },
  {
    id: "prod-10",
    name: "Silver Metallic Stretch Shimmer Leggings",
    slug: "silver-metallic-stretch-shimmer-leggings",
    description:
      "Premium quality silver shimmer 4-way stretch leggings offering snug fit and radiant sheen for party wear and festive styling.",
    price: 549,
    compareAtPrice: 799,
    images: {
      primary: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: freeSizes,
    categoryId: "cat-shimmer-leggings",
    categorySlug: "shimmer-leggings",
    collectionIds: ["new-arrivals"],
    tags: ["Shimmer Leggings", "Silver", "Party Wear", "Stretch"],
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-SHL-010",
    createdAt: "2026-01-13T00:00:00Z",
    updatedAt: "2026-01-13T00:00:00Z",
  },
  {
    id: "prod-11",
    name: "Kundan & Pearl Statement Jhumkas",
    slug: "kundan-pearl-statement-jhumkas",
    description:
      "Handcrafted gold-plated jhumkas embellished with semi-precious kundan stones and delicate hanging freshwater seed pearls.",
    price: 499,
    compareAtPrice: 899,
    images: {
      primary: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: freeSizes,
    categoryId: "cat-accessories-trinketz",
    categorySlug: "accessories-trinketz",
    collectionIds: ["best-sellers"],
    tags: ["Accessories", "Trinketz", "Jhumkas", "Jewelry"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ET-TRK-011",
    createdAt: "2026-01-07T00:00:00Z",
    updatedAt: "2026-01-07T00:00:00Z",
  },
];

/**
 * Adapter helper to transform full Product to ProductCardData format.
 * Guarantees primaryImage and hoverImage resolution.
 */
export function toProductCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    primaryImage: product.images.primary,
    hoverImage: product.images.hover || undefined,
    image: product.images.primary,
    price: product.price,
    compareAtPrice: product.compareAtPrice || undefined,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isOutOfStock: product.isOutOfStock,
    href: `/products/${product.slug}`,
  };
}

/**
 * Helper to get all displayable image URLs for a product (primary, hover, gallery)
 */
export function getProductImageUrls(product: Product): string[] {
  const urls: string[] = [product.images.primary];
  if (product.images.hover) {
    urls.push(product.images.hover);
  }
  if (product.images.gallery && product.images.gallery.length > 0) {
    urls.push(...product.images.gallery);
  }
  return urls;
}

export const demoProductCards: ProductCardData[] = demoProducts.map(toProductCardData);
