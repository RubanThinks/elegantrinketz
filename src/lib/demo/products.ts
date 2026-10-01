import type { Product, ProductCardData, ProductSize } from "@/types";

const defaultSizes: ProductSize[] = [
  { id: "S", name: "S", stock: 12, isAvailable: true },
  { id: "M", name: "M", stock: 8, isAvailable: true },
  { id: "L", name: "L", stock: 4, isAvailable: true },
  { id: "XL", name: "XL", stock: 0, isAvailable: false },
];

/**
 * DEMO PRODUCTS DATA (Conforms to Phase 2 Product Architecture)
 *
 * NOTE: Products support the strict primary, hover, gallery image architecture
 * as well as size-level inventory breakdown.
 */
export const demoProducts: Product[] = [
  {
    id: "prod-1",
    name: "Ivory Embroidered Anarkali",
    slug: "ivory-embroidered-anarkali",
    description:
      "Crafted from ethereal georgette, this ivory Anarkali suit features delicate tone-on-tone thread embroidery and pearl embellishments.",
    price: 12999,
    compareAtPrice: 15999,
    images: {
      primary: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-ethnic-wear",
    categorySlug: "ethnic-wear",
    collectionIds: ["new-arrivals", "festive-edit"],
    tags: ["Ethnic", "Anarkali", "Embroidered", "Festive"],
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ATL-ANR-001",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "prod-2",
    name: "Rose Pink Organza Saree",
    slug: "rose-pink-organza-saree",
    description:
      "Lightweight, sheer organza saree hand-painted with soft floral motifs and bordered with scalloped zari embroidery.",
    price: 8499,
    compareAtPrice: 9999,
    images: {
      primary: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: [
      { id: "FREE", name: "Free Size (6.3m)", stock: 15, isAvailable: true },
    ],
    categoryId: "cat-sarees",
    categorySlug: "sarees",
    collectionIds: ["new-arrivals", "wedding-season"],
    tags: ["Saree", "Organza", "Pastel", "Floral"],
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ATL-SAR-002",
    createdAt: "2026-01-12T00:00:00Z",
    updatedAt: "2026-01-12T00:00:00Z",
  },
  {
    id: "prod-3",
    name: "Midnight Blue Kurti",
    slug: "midnight-blue-kurti",
    description:
      "A tailored silhouette in raw silk with subtle geometric threadwork along the neckline and cuffs. Perfect for elevated daily styling.",
    price: 3899,
    compareAtPrice: 4499,
    images: {
      primary: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-kurtis",
    categorySlug: "kurtis",
    collectionIds: ["best-sellers"],
    tags: ["Kurti", "Silk", "Workwear", "Casual"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ATL-KUR-003",
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: "2026-01-05T00:00:00Z",
  },
  {
    id: "prod-4",
    name: "Champagne Festive Lehenga",
    slug: "champagne-festive-lehenga",
    description:
      "Handcrafted net lehenga adorned with champagne sequins, cutdana, and metallic pita work. Includes a sweetheart blouse and veil.",
    price: 34999,
    compareAtPrice: 42999,
    images: {
      primary: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: [
      { id: "S", name: "S", stock: 2, isAvailable: true },
      { id: "M", name: "M", stock: 4, isAvailable: true },
      { id: "L", name: "L", stock: 0, isAvailable: false },
    ],
    categoryId: "cat-lehengas",
    categorySlug: "lehengas",
    collectionIds: ["wedding-season"],
    tags: ["Lehenga", "Bridal", "Champagne", "Couture"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ATL-LEH-004",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "prod-5",
    name: "Sage Green Cotton Dress",
    slug: "sage-green-cotton-dress",
    description:
      "Tiered midi dress in breathable organic cotton with puff sleeves, smocked bodice, and subtle wood-button accents.",
    price: 4299,
    images: {
      primary: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: defaultSizes,
    categoryId: "cat-dresses",
    categorySlug: "dresses",
    collectionIds: ["new-arrivals"],
    tags: ["Dress", "Cotton", "Midi", "Summer"],
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ATL-DRS-005",
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  },
  {
    id: "prod-6",
    name: "Heritage Banarasi Brocade Saree",
    slug: "heritage-banarasi-brocade-saree",
    description:
      "Pure katan silk handloom Banarasi saree featuring intricate floral kadwa weave and a heavy gold zari pallu.",
    price: 18999,
    compareAtPrice: 22500,
    images: {
      primary: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      ],
    },
    sizes: [
      { id: "FREE", name: "Free Size (6.3m)", stock: 0, isAvailable: false },
    ],
    categoryId: "cat-sarees",
    categorySlug: "sarees",
    collectionIds: ["wedding-season"],
    tags: ["Banarasi", "Silk", "Heritage", "Zari"],
    isNew: false,
    isBestSeller: false,
    isOutOfStock: true,
    isFeatured: true,
    isPublished: true,
    sku: "ATL-SAR-006",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prod-7",
    name: "Dusty Mauve Peplum Top",
    slug: "dusty-mauve-peplum-top",
    description:
      "Structured chanderi silk peplum top with gota patti detailing around the mandarin collar and flared hemline.",
    price: 2899,
    images: {
      primary: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      gallery: [],
    },
    sizes: defaultSizes,
    categoryId: "cat-tops",
    categorySlug: "tops",
    collectionIds: ["new-arrivals"],
    tags: ["Top", "Peplum", "Silk", "Festive"],
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    isPublished: true,
    isOutOfStock: false,
    sku: "ATL-TOP-007",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "prod-8",
    name: "Crimson Velvet Kaftan",
    slug: "crimson-velvet-kaftan",
    description:
      "Lush micro-velvet kaftan with antique marodi hand embroidery on the neckline, accompanied by tassel tie-ups.",
    price: 9499,
    compareAtPrice: 11999,
    images: {
      primary: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
      hover: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      gallery: [],
    },
    sizes: [
      { id: "FREE", name: "Free Size", stock: 6, isAvailable: true },
    ],
    categoryId: "cat-ethnic-wear",
    categorySlug: "ethnic-wear",
    collectionIds: ["festive-edit", "best-sellers"],
    tags: ["Velvet", "Kaftan", "Crimson", "Evening"],
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    isPublished: true,
    isOutOfStock: false,
    sku: "ATL-KAF-008",
    createdAt: "2026-01-08T00:00:00Z",
    updatedAt: "2026-01-08T00:00:00Z",
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
