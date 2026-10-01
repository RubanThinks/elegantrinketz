/* ------------------------------------------------------------------ */
/*  USER & ROLE TYPES                                                  */
/* ------------------------------------------------------------------ */

export type UserRole = "customer" | "admin" | "super_admin";

export interface Address {
  id: string;
  label?: string; // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string | null;
  role: UserRole;
  isActive: boolean;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  PRODUCT TYPES & IMAGE ARCHITECTURE                                */
/* ------------------------------------------------------------------ */

export type ProductStatus = "draft" | "published" | "archived";

export type ProductImageRoleType = "primary" | "hover" | "gallery";

export interface ProductMediaItem {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  alt: string;
  role: ProductImageRoleType;
  sortOrder: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  role?: ProductImageRoleType;
  order?: number;
  width?: number;
  height?: number;
}

/** Strongly typed product image structure for primary, hover, and gallery */
export interface ProductImages {
  primary: string;
  hover: string | null;
  gallery: string[];
  mediaItems?: ProductMediaItem[];
}

/** Size-level inventory item */
export interface ProductSize {
  id: string; // e.g., "XS", "S", "M", "L", "XL", "Free Size"
  name: string;
  stock: number;
  isAvailable: boolean;
}

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export const LOW_STOCK_THRESHOLD = 3;

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  collectionIds: string[];
  /** Strongly typed structured image representation */
  images: ProductImages;
  /** Optional full Cloudinary media items */
  media?: ProductMediaItem[];
  /** Optional raw image items array for metadata */
  imageItems?: ProductImage[];
  /** Size-level inventory breakdown */
  sizes: ProductSize[];
  tags: string[];
  status?: ProductStatus;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isOutOfStock?: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  /** Primary image displayed in resting state */
  primaryImage: string;
  /** Secondary image smoothly crossfaded on desktop hover */
  hoverImage?: string;
  /** Backwards compatibility alias for primaryImage */
  image: string;
  price: number;
  compareAtPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOutOfStock?: boolean;
  href: string;
}

/* ------------------------------------------------------------------ */
/*  CATEGORY TYPES                                                     */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  isActive?: boolean;
  sortOrder?: number;
  order?: number;
  parentId?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  COLLECTION TYPES                                                   */
/* ------------------------------------------------------------------ */

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  productIds?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  CART & WISHLIST TYPES                                               */
/* ------------------------------------------------------------------ */

export interface CartItem {
  id?: string;
  userId: string;
  productId: string;
  sizeId?: string | null;
  sizeName?: string | null;
  quantity: number;
  unitPrice?: number;
  productName?: string;
  productSlug?: string;
  sku?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  /** Hydrated product info for UI display and validation */
  product?: {
    name: string;
    slug: string;
    image: string;
    price: number;
    sku?: string;
    isOutOfStock?: boolean;
    status?: ProductStatus;
    sizes?: ProductSize[];
  };
}

export interface WishlistItem {
  id?: string;
  userId: string;
  productId: string;
  createdAt: string;
  /** Hydrated product info for UI display */
  product?: {
    name: string;
    slug: string;
    image: string;
    price: number;
    compareAtPrice?: number;
    isOutOfStock?: boolean;
  };
}

/* ------------------------------------------------------------------ */
/*  ORDER / ENQUIRY TYPES (WhatsApp ordering foundation)               */
/* ------------------------------------------------------------------ */

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  sku?: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal?: number;
  sizeId?: string | null;
  sizeName?: string | null;
}

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface Order {
  id: string;
  /** Human-readable order number, e.g. ORD-20260927-0001 */
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: OrderStatus;
  totalAmount: number | null;
  whatsappInitiated: boolean;
  items: OrderItem[];
  shippingAddress?: Address;
  notes?: string;
  /** Admin who confirmed or cancelled the order */
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  /** Whether inventory was atomically deducted on confirmation */
  inventoryDeducted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backwards-compatibility alias
export type OrderEnquiry = Order;

/* ------------------------------------------------------------------ */
/*  SITE SETTINGS & ADMIN ACTIVITY TYPES                               */
/* ------------------------------------------------------------------ */

export interface SiteSettings {
  businessName: string;
  logoUrl?: string;
  faviconUrl?: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  instagramUrl: string;
  facebookUrl: string;
  address: string;
  currency: string;
  country: string;
  updatedAt: string;
}

export interface AdminActivity {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  createdAt: string;
}
