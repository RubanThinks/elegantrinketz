import { getProductById } from "@/services/products";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/config/constants";
import type { CartItem, Product, ProductSize } from "@/types";

export type CartIssueType =
  | "deleted"
  | "unpublished"
  | "size_unavailable"
  | "out_of_stock"
  | "insufficient_stock"
  | "price_changed";

export interface CartItemValidationIssue {
  itemId?: string;
  productId: string;
  sizeId?: string | null;
  sizeName?: string | null;
  productName: string;
  type: CartIssueType;
  message: string;
  oldPrice?: number;
  currentPrice?: number;
  availableStock?: number;
  requestedQuantity?: number;
  adjustedQuantity?: number;
}

export interface ValidatedCartOrderItem {
  productId: string;
  productName: string;
  sku: string;
  sizeName?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productSlug: string;
  image?: string;
}

export interface CartValidationResult {
  isValid: boolean;
  issues: CartItemValidationIssue[];
  validatedItems: ValidatedCartOrderItem[];
  subtotal: number;
  totalQuantity: number;
}

/**
 * Authoritatively validates cart items against real-time Firestore product records.
 * NEVER trusts the browser-supplied unitPrice or inventory count.
 */
export async function validateCartItemsForOrder(
  cartItems: CartItem[]
): Promise<CartValidationResult> {
  const issues: CartItemValidationIssue[] = [];
  const validatedItems: ValidatedCartOrderItem[] = [];

  if (!cartItems || cartItems.length === 0) {
    return {
      isValid: false,
      issues: [
        {
          productId: "",
          productName: "Shopping Bag",
          type: "out_of_stock",
          message: "Your bag is currently empty.",
        },
      ],
      validatedItems: [],
      subtotal: 0,
      totalQuantity: 0,
    };
  }

  // Fetch unique products from Firestore
  const uniqueProductIds = Array.from(new Set(cartItems.map((i) => i.productId)));
  const productMap = new Map<string, Product | null>();

  await Promise.all(
    uniqueProductIds.map(async (id) => {
      const prod = await getProductById(id);
      productMap.set(id, prod);
    })
  );

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    const displayName = item.productName || product?.name || "Product";

    // 1. Verify existence
    if (!product) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        sizeId: item.sizeId,
        sizeName: item.sizeName,
        productName: displayName,
        type: "deleted",
        message: `"${displayName}" is no longer available in the store catalog.`,
      });
      continue;
    }

    // 2. Verify publication status
    if (product.status !== "published" || !product.isPublished) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        sizeId: item.sizeId,
        sizeName: item.sizeName,
        productName: product.name,
        type: "unpublished",
        message: `"${product.name}" is temporarily unavailable.`,
      });
      continue;
    }

    // 3. Verify size variant & stock
    let targetSize: ProductSize | undefined;
    let availableStock = product.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0) ?? 0;

    if (product.sizes && product.sizes.length > 0) {
      // Find matching size variant by ID or Name
      targetSize = product.sizes.find(
        (s) =>
          (item.sizeId && s.id === item.sizeId) ||
          (item.sizeName && s.name === item.sizeName) ||
          (item.sizeId && s.name === item.sizeId)
      );

      if (!targetSize) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          sizeId: item.sizeId,
          sizeName: item.sizeName,
          productName: product.name,
          type: "size_unavailable",
          message: `Size "${item.sizeName || item.sizeId}" for "${product.name}" is no longer available.`,
        });
        continue;
      }

      availableStock = targetSize.stock;

      if (!targetSize.isAvailable || availableStock <= 0) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          sizeId: targetSize.id || targetSize.name,
          sizeName: targetSize.name,
          productName: product.name,
          type: "out_of_stock",
          message: `"${product.name}" in size ${targetSize.name} is currently sold out.`,
          availableStock: 0,
        });
        continue;
      }
    } else {
      if (product.isOutOfStock || availableStock <= 0) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          productName: product.name,
          type: "out_of_stock",
          message: `"${product.name}" is currently sold out.`,
          availableStock: 0,
        });
        continue;
      }
    }

    // 4. Verify quantity vs stock
    const requestedQty = Math.max(1, Math.floor(item.quantity || 1));
    if (requestedQty > availableStock) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        sizeId: item.sizeId,
        sizeName: targetSize?.name || item.sizeName,
        productName: product.name,
        type: "insufficient_stock",
        message: `Only ${availableStock} unit${availableStock > 1 ? "s" : ""} available for "${product.name}"${targetSize ? ` (Size ${targetSize.name})` : ""}. You currently have ${requestedQty} in your bag.`,
        availableStock,
        requestedQuantity: requestedQty,
        adjustedQuantity: availableStock,
      });
      continue;
    }

    // 5. Verify authoritative price
    const authoritativePrice = product.price;
    if (typeof item.unitPrice === "number" && item.unitPrice !== authoritativePrice) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        sizeId: item.sizeId,
        sizeName: targetSize?.name || item.sizeName,
        productName: product.name,
        type: "price_changed",
        message: `The price for "${product.name}" has changed from ${formatPrice(item.unitPrice)} to ${formatPrice(authoritativePrice)}. Please review the updated subtotal.`,
        oldPrice: item.unitPrice,
        currentPrice: authoritativePrice,
      });
      continue;
    }

    // Clean valid item
    const lineTotal = authoritativePrice * requestedQty;
    validatedItems.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku || "N/A",
      sizeName: targetSize?.name || item.sizeName || null,
      quantity: requestedQty,
      unitPrice: authoritativePrice,
      lineTotal,
      productSlug: product.slug,
      image: product.images?.primary || item.image || "",
    });
  }

  const subtotal = validatedItems.reduce((acc, i) => acc + i.lineTotal, 0);
  const totalQuantity = validatedItems.reduce((acc, i) => acc + i.quantity, 0);

  return {
    isValid: issues.length === 0,
    issues,
    validatedItems,
    subtotal,
    totalQuantity,
  };
}

/**
 * Builds the authoritative, formatted multi-product WhatsApp order message and URL.
 * Strictly uses validated items and siteConfig.
 */
export function buildWhatsAppOrderUrl(
  validatedItems: ValidatedCartOrderItem[],
  subtotal: number,
  totalQuantity: number
): { url: string; message: string; error?: string } {
  const rawPhone = siteConfig.whatsappNumber || "";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");

  if (!cleanPhone) {
    return {
      url: "",
      message: "",
      error: "Store WhatsApp number is not configured in site settings.",
    };
  }

  // Format order items list with product URL
  const itemsText = validatedItems
    .map((item, index) => {
      const parts = [
        `${index + 1}. *${item.productName}*`,
        `   SKU: ${item.sku}`,
        item.sizeName ? `   Size: ${item.sizeName}` : null,
        `   Qty: ${item.quantity}`,
        `   Price: ${formatPrice(item.unitPrice)}`,
        `   Total: ${formatPrice(item.lineTotal)}`,
        item.productSlug ? `   Link: ${siteConfig.url}/products/${item.productSlug}` : null,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");

  const lines = [
    `Hello ${siteConfig.name},`,
    "",
    "I'd like to order the following from my shopping bag:",
    "",
    itemsText,
    "",
    "--------------------------------",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Total Items: ${totalQuantity}`,
    "",
    "Please confirm item availability and provide payment/shipping details.",
    "",
    "Thank you!",
  ];

  const message = lines.join("\n");

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return { url, message };
}
