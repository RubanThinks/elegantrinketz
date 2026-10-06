import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { logAdminActivity } from "@/services/activity";
import type {
  Order,
  OrderItem,
  OrderStatus,
  OrderTrackingHistoryItem,
  ProductSize,
} from "@/types";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

/**
 * Generates an official human-readable order number: ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

/**
 * Helper to convert Firestore doc to typed Order
 */
function mapDocToOrder(id: string, data: DocumentData): Order {
  return {
    id,
    orderNumber: data.orderNumber || `ORD-${id.slice(0, 8).toUpperCase()}`,
    userId: data.userId || null,
    customerName: data.customerName || "Customer",
    customerPhone: data.customerPhone || "",
    customerEmail: data.customerEmail || null,
    status: (data.status as OrderStatus) || "pending",
    totalAmount: typeof data.totalAmount === "number" ? data.totalAmount : null,
    whatsappInitiated: data.whatsappInitiated !== false,
    items: Array.isArray(data.items) ? data.items : [],
    shippingAddress: data.shippingAddress || undefined,
    notes: data.notes || undefined,
    confirmedBy: data.confirmedBy || null,
    confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || data.confirmedAt || null,
    cancelledAt: data.cancelledAt?.toDate?.()?.toISOString() || data.cancelledAt || null,
    cancelReason: data.cancelReason || null,
    inventoryDeducted: Boolean(data.inventoryDeducted),

    // Tracking details
    trackingNumber: data.trackingNumber || null,
    carrier: data.carrier || null,
    trackingUrl: data.trackingUrl || null,
    estimatedDelivery: data.estimatedDelivery || null,
    shippedAt: data.shippedAt?.toDate?.()?.toISOString() || data.shippedAt || null,
    deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || data.deliveredAt || null,
    trackingHistory: Array.isArray(data.trackingHistory)
      ? data.trackingHistory.map((th: Record<string, unknown>) => ({
          id: String(th.id || ""),
          status: (th.status as OrderStatus) || "confirmed",
          title: String(th.title || ""),
          description: th.description ? String(th.description) : undefined,
          location: th.location ? String(th.location) : undefined,
          timestamp: String(th.timestamp || new Date().toISOString()),
          updatedBy: th.updatedBy ? String(th.updatedBy) : undefined,
        }))
      : [],

    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export interface CreateAdminOrderItemInput {
  productId: string;
  sizeId?: string | null;
  sizeName?: string | null;
  quantity: number;
  unitPrice?: number;
}

export interface CreateAdminOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  userId?: string | null;
  items: CreateAdminOrderItemInput[];
  notes?: string;
  adminUid: string;
  adminEmail?: string;
}

/**
 * ADMIN-INITIATED ORDER CREATION (Phase 6.1)
 *
 * The admin creates a pending order from WhatsApp communication.
 * Validates products/sizes and snapshots all item fields (immutable historical record).
 */
export async function createAdminOrder(
  input: CreateAdminOrderInput
): Promise<{ success: boolean; id?: string; orderNumber?: string; message: string }> {
  const { customerName, customerPhone, customerEmail, userId, items, notes, adminUid, adminEmail } = input;

  if (!customerName?.trim() || !customerPhone?.trim()) {
    return { success: false, message: "Customer name and phone number are required." };
  }

  if (!items || items.length === 0) {
    return { success: false, message: "Order must contain at least one item." };
  }

  try {
    const db = getFirebaseDb();
    const snapshottedItems: OrderItem[] = [];

    for (const itemInput of items) {
      if (itemInput.quantity <= 0) {
        return { success: false, message: "Item quantity must be greater than zero." };
      }

      const productRef = doc(db, PRODUCTS_COLLECTION, itemInput.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return { success: false, message: `Product with ID ${itemInput.productId} not found.` };
      }

      const productData = productSnap.data();
      const sizes: ProductSize[] = Array.isArray(productData.sizes) ? productData.sizes : [];

      let chosenSizeName = itemInput.sizeName || null;
      let chosenSizeId = itemInput.sizeId || null;

      if (sizes.length > 0) {
        const found = sizes.find(
          (s) => s.id === itemInput.sizeId || s.name === itemInput.sizeName || s.name === itemInput.sizeId
        );
        if (!found) {
          return {
            success: false,
            message: `Size variant '${itemInput.sizeName || itemInput.sizeId}' not found for product "${productData.name}".`,
          };
        }
        chosenSizeName = found.name;
        chosenSizeId = found.id;
      }

      const finalPrice = typeof itemInput.unitPrice === "number" ? itemInput.unitPrice : (productData.price || 0);
      const lineTotal = finalPrice * itemInput.quantity;

      snapshottedItems.push({
        productId: itemInput.productId,
        name: productData.name || "Product",
        slug: productData.slug || "",
        sku: productData.sku || "",
        image: productData.images?.primary || "",
        price: finalPrice,
        quantity: itemInput.quantity,
        lineTotal,
        sizeId: chosenSizeId,
        sizeName: chosenSizeName,
      });
    }

    const totalAmount = snapshottedItems.reduce((acc, i) => acc + (i.lineTotal || (i.price * i.quantity)), 0);
    const orderNumber = generateOrderNumber();

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      orderNumber,
      userId: userId || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      status: "pending",
      totalAmount,
      whatsappInitiated: true,
      items: snapshottedItems,
      notes: notes?.trim() || undefined,
      inventoryDeducted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log admin activity
    await logAdminActivity({
      adminId: adminUid,
      adminEmail,
      action: "CREATE_ORDER",
      entityType: "ORDER",
      entityId: docRef.id,
      description: `Admin created pending order ${orderNumber} for customer "${customerName}".`,
    });

    return {
      success: true,
      id: docRef.id,
      orderNumber,
      message: `Pending order ${orderNumber} created successfully.`,
    };
  } catch (error: unknown) {
    console.error("[OrdersService] Failed to create admin order:", error);
    return {
      success: false,
      message: (error as Error)?.message || "Failed to create order.",
    };
  }
}

/**
 * Backwards compatibility alias for createAdminOrder
 */
export async function createOrderEnquiry(
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<{ id: string; orderNumber: string }> {
  const db = getFirebaseDb();
  const orderNumber = orderData.orderNumber || generateOrderNumber();

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...orderData,
    orderNumber,
    whatsappInitiated: orderData.whatsappInitiated !== false,
    status: "pending",
    inventoryDeducted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, orderNumber };
}

/**
 * Fetch orders for a registered customer (Strict privacy: scoped to userId).
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!userId) return [];
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    const orders = snap.docs.map((docSnap) =>
      mapDocToOrder(docSnap.id, docSnap.data())
    );

    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("[OrdersService] Error fetching user orders:", error);
    return [];
  }
}

export interface GetAdminOrdersParams {
  status?: OrderStatus | "all";
  search?: string;
  maxLimit?: number;
}

/**
 * Fetch all orders for admin review with filtering and searching.
 */
export async function getAdminOrders(
  params: GetAdminOrdersParams = {}
): Promise<Order[]> {
  try {
    const db = getFirebaseDb();
    const { status = "all", search = "", maxLimit = 100 } = params;

    let q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );

    if (status && status !== "all") {
      q = query(
        collection(db, ORDERS_COLLECTION),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(maxLimit)
      );
    }

    const snap = await getDocs(q);
    let orders = snap.docs.map((docSnap) =>
      mapDocToOrder(docSnap.id, docSnap.data())
    );

    if (search.trim()) {
      const qLower = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(qLower) ||
          o.customerName?.toLowerCase().includes(qLower) ||
          o.customerPhone?.toLowerCase().includes(qLower) ||
          o.customerEmail?.toLowerCase().includes(qLower) ||
          o.items?.some((item) => item.name?.toLowerCase().includes(qLower))
      );
    }

    return orders;
  } catch (error) {
    console.error("[OrdersService] Error fetching admin orders:", error);
    return [];
  }
}

/**
 * Fetch a single order by ID.
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;
    return mapDocToOrder(snap.id, snap.data());
  } catch (error) {
    console.error("[OrdersService] Error fetching order by ID:", error);
    return null;
  }
}

/**
 * ATOMIC CONFIRMATION AND INVENTORY DEDUCTION (Phase 6 & 6.1)
 *
 * Runs inside a Firestore transaction:
 * 1. Checks that the order is strictly in 'pending' status.
 * 2. Checks that inventory hasn't already been deducted (duplicate prevention).
 * 3. Reads each product document involved in the order.
 * 4. Validates that every requested item has sufficient stock in its chosen size variant.
 * 5. Atomically deducts stock from product size variants.
 * 6. Recalculates totalStock, inventoryStatus, and isOutOfStock on each product.
 * 7. Updates order status to 'confirmed', sets confirmedBy, confirmedAt, and inventoryDeducted = true.
 * 8. Records audit activity log ONLY upon successful commit.
 */
export async function confirmOrder(
  orderId: string,
  adminUid: string,
  adminEmail?: string
): Promise<{ success: boolean; message: string }> {
  const db = getFirebaseDb();
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Read Order Document inside transaction
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error("Order not found.");
      }

      const orderData = orderSnap.data();
      if (orderData.status !== "pending") {
        throw new Error(
          `Cannot confirm order: current status is '${orderData.status}'. Only 'pending' orders can be confirmed.`
        );
      }

      if (orderData.inventoryDeducted === true) {
        throw new Error("Duplicate confirmation rejected: Inventory for this order has already been deducted.");
      }

      const items: OrderItem[] = orderData.items || [];
      if (items.length === 0) {
        throw new Error("Order has no items to deduct from inventory.");
      }

      // 2. Collect unique product references to read within transaction
      const productIds = Array.from(new Set(items.map((i) => i.productId)));
      const productSnaps = new Map<string, DocumentData>();

      for (const pId of productIds) {
        const pRef = doc(db, PRODUCTS_COLLECTION, pId);
        const pSnap = await transaction.get(pRef);
        if (!pSnap.exists()) {
          throw new Error(`Product ID ${pId} not found in catalog.`);
        }
        productSnaps.set(pId, pSnap.data());
      }

      // 3. Validate stock sufficiency & prepare updated product models
      const updatedProducts = new Map<
        string,
        { sizes: ProductSize[]; totalStock: number; inventoryStatus: string; isOutOfStock: boolean }
      >();

      // Group requested quantities by product & size
      const requestedByProduct = new Map<string, Map<string, number>>();
      for (const item of items) {
        if (!requestedByProduct.has(item.productId)) {
          requestedByProduct.set(item.productId, new Map<string, number>());
        }
        const sizeMap = requestedByProduct.get(item.productId)!;
        const sizeKey = item.sizeId || item.sizeName || "default";
        sizeMap.set(sizeKey, (sizeMap.get(sizeKey) || 0) + item.quantity);
      }

      for (const [pId, sizeMap] of requestedByProduct.entries()) {
        const pData = productSnaps.get(pId);
        if (!pData) {
          throw new Error(`Product data not found for ID "${pId}".`);
        }
        const currentSizes: ProductSize[] = Array.isArray(pData.sizes) ? [...pData.sizes] : [];

        for (const [sizeKey, reqQty] of sizeMap.entries()) {
          if (sizeKey === "default" && currentSizes.length === 0) {
            continue;
          }

          const sizeIndex = currentSizes.findIndex(
            (s) => s.id === sizeKey || s.name === sizeKey
          );

          if (sizeIndex === -1) {
            throw new Error(
              `Size variant '${sizeKey}' not found for product "${pData.name || pId}".`
            );
          }

          const currentStock = currentSizes[sizeIndex].stock || 0;
          if (currentStock < reqQty) {
            throw new Error(
              `Insufficient stock for "${pData.name || pId}" (${currentSizes[sizeIndex].name}): requested ${reqQty}, available ${currentStock}.`
            );
          }

          // Deduct stock
          const newStock = currentStock - reqQty;
          currentSizes[sizeIndex] = {
            ...currentSizes[sizeIndex],
            stock: newStock,
            isAvailable: newStock > 0,
          };
        }

        const totalRemainingStock = currentSizes.reduce(
          (sum, s) => sum + Math.max(0, s.stock || 0),
          0
        );
        const isOutOfStock = currentSizes.length > 0 ? totalRemainingStock <= 0 : false;
        const inventoryStatus =
          totalRemainingStock === 0
            ? "out_of_stock"
            : totalRemainingStock <= 3
            ? "low_stock"
            : "in_stock";

        updatedProducts.set(pId, {
          sizes: currentSizes,
          totalStock: totalRemainingStock,
          inventoryStatus,
          isOutOfStock,
        });
      }

      // 4. Perform atomic updates on all products
      for (const [pId, updateData] of updatedProducts.entries()) {
        const pRef = doc(db, PRODUCTS_COLLECTION, pId);
        transaction.update(pRef, {
          sizes: updateData.sizes,
          totalStock: updateData.totalStock,
          inventoryStatus: updateData.inventoryStatus,
          isOutOfStock: updateData.isOutOfStock,
          updatedAt: serverTimestamp(),
        });
      }

      // 5. Update Order Document
      transaction.update(orderRef, {
        status: "confirmed",
        confirmedBy: adminUid,
        confirmedAt: serverTimestamp(),
        inventoryDeducted: true,
        updatedAt: serverTimestamp(),
      });
    });

    // 6. Record audit activity ONLY on successful commit
    await logAdminActivity({
      adminId: adminUid,
      adminEmail,
      action: "CONFIRM_ORDER",
      entityType: "ORDER",
      entityId: orderId,
      description: `Confirmed order ${orderId} and atomically deducted inventory.`,
    });

    return {
      success: true,
      message: "Order successfully confirmed and inventory deducted.",
    };
  } catch (error: unknown) {
    console.error("[OrdersService] Confirmation failed:", error);
    return {
      success: false,
      message: (error as Error)?.message || "Failed to confirm order.",
    };
  }
}

/**
 * CANCEL PENDING ORDER (Phase 6.1)
 *
 * Only pending orders can be cancelled.
 * Confirmed orders cannot be cancelled in Phase 6 to prevent inventory corruption.
 * Automatic restocking is explicitly removed.
 */
export async function cancelOrder(
  orderId: string,
  adminUid: string,
  reason: string,
  adminEmail?: string
): Promise<{ success: boolean; message: string }> {
  const db = getFirebaseDb();
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  try {
    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error("Order not found.");
      }

      const orderData = orderSnap.data();
      if (orderData.status === "cancelled") {
        throw new Error("Order is already cancelled.");
      }

      // Phase 6.1 Requirement 3: Confirmed orders cannot be cancelled / restocked in Phase 6
      if (orderData.status === "confirmed") {
        throw new Error(
          "Confirmed-order cancellation/restocking workflow is not yet implemented. Confirmed orders cannot be cancelled in this phase."
        );
      }

      if (orderData.status !== "pending") {
        throw new Error(`Cannot cancel order in '${orderData.status}' status.`);
      }

      // Update Order to cancelled (No inventory was deducted, so no stock changes occur)
      transaction.update(orderRef, {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        cancelReason: reason || "Cancelled by administrator",
        updatedAt: serverTimestamp(),
      });
    });

    // Audit log only on successful cancellation
    await logAdminActivity({
      adminId: adminUid,
      adminEmail,
      action: "CANCEL_ORDER",
      entityType: "ORDER",
      entityId: orderId,
      description: `Cancelled pending order ${orderId}. Reason: ${reason || "No reason given"}.`,
    });

    return {
      success: true,
      message: "Pending order cancelled successfully.",
    };
  } catch (error: unknown) {
    console.error("[OrdersService] Cancel failed:", error);
    return {
      success: false,
      message: (error as Error)?.message || "Failed to cancel order.",
    };
  }
}

/**
 * Common carrier tracking link builder.
 * Automatically generates carrier portal URLs if standard carrier is selected.
 */
export function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const cleanNumber = trackingNumber.trim();
  const cLower = carrier.toLowerCase().trim();

  if (!cleanNumber) return "";

  if (cLower.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${cleanNumber}`;
  }
  if (cLower.includes("blue dart") || cLower.includes("bluedart")) {
    return `https://www.bluedart.com/tracking?handler=tnt&action=custtrack&trackid=${cleanNumber}`;
  }
  if (cLower.includes("dtdc")) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${cleanNumber}`;
  }
  if (cLower.includes("india post") || cLower.includes("speed post")) {
    return `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx`;
  }
  if (cLower.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${cleanNumber}`;
  }
  if (cLower.includes("dhl")) {
    return `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${cleanNumber}`;
  }
  if (cLower.includes("ecom express")) {
    return `https://ecomexpress.in/tracking/?awb_number=${cleanNumber}`;
  }

  return "";
}

export interface UpdateOrderTrackingInput {
  orderId: string;
  adminUid: string;
  adminEmail?: string;
  status?: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  trackingNote?: string;
  location?: string;
}

/**
 * UPDATE ORDER TRACKING & STATUS
 *
 * Allows administrators to update order fulfillment status (processing, shipped, delivered),
 * update tracking details (carrier, tracking number, URL, estimated delivery),
 * and record milestone updates in trackingHistory.
 * Changes are reflected in real-time on both admin and customer account views.
 */
export async function updateOrderTracking(
  input: UpdateOrderTrackingInput
): Promise<{ success: boolean; message: string }> {
  const {
    orderId,
    adminUid,
    adminEmail,
    status,
    trackingNumber,
    carrier,
    trackingUrl,
    estimatedDelivery,
    trackingNote,
    location,
  } = input;

  if (!orderId) {
    return { success: false, message: "Order ID is required." };
  }

  try {
    const db = getFirebaseDb();
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);

    const snap = await getDoc(orderRef);
    if (!snap.exists()) {
      return { success: false, message: "Order not found." };
    }

    const currentData = snap.data();
    const targetStatus = status || (currentData.status as OrderStatus) || "pending";

    // Auto-generate tracking URL if missing but carrier and number provided
    let finalTrackingUrl = trackingUrl !== undefined ? trackingUrl : currentData.trackingUrl;
    if (!finalTrackingUrl && carrier && trackingNumber) {
      finalTrackingUrl = getCarrierTrackingUrl(carrier, trackingNumber);
    }

    // Build history milestone entry
    const existingHistory: OrderTrackingHistoryItem[] = Array.isArray(currentData.trackingHistory)
      ? currentData.trackingHistory
      : [];

    let statusTitle = "Order Updated";
    switch (targetStatus) {
      case "pending":
        statusTitle = "Order Received & Pending";
        break;
      case "confirmed":
        statusTitle = "Order Confirmed";
        break;
      case "processing":
        statusTitle = "Processing & Handcrafting in Atelier";
        break;
      case "shipped":
        statusTitle = carrier ? `Dispatched via ${carrier}` : "Order Shipped & In Transit";
        break;
      case "delivered":
        statusTitle = "Order Delivered";
        break;
      case "cancelled":
        statusTitle = "Order Cancelled";
        break;
    }

    const milestone: OrderTrackingHistoryItem = {
      id: `trk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: targetStatus,
      title: statusTitle,
      description:
        trackingNote?.trim() ||
        (carrier && trackingNumber
          ? `Package in transit via ${carrier} (AWB: ${trackingNumber}).`
          : `Status changed to ${targetStatus}.`),
      location: location?.trim() || undefined,
      timestamp: new Date().toISOString(),
      updatedBy: adminEmail || adminUid,
    };

    const updatedHistory = [...existingHistory, milestone];

    const updatePayload: Record<string, unknown> = {
      status: targetStatus,
      trackingHistory: updatedHistory,
      updatedAt: serverTimestamp(),
    };

    if (trackingNumber !== undefined) updatePayload.trackingNumber = trackingNumber?.trim() || null;
    if (carrier !== undefined) updatePayload.carrier = carrier?.trim() || null;
    if (finalTrackingUrl !== undefined) updatePayload.trackingUrl = finalTrackingUrl?.trim() || null;
    if (estimatedDelivery !== undefined) updatePayload.estimatedDelivery = estimatedDelivery?.trim() || null;

    if (targetStatus === "shipped" && !currentData.shippedAt) {
      updatePayload.shippedAt = serverTimestamp();
    }
    if (targetStatus === "delivered" && !currentData.deliveredAt) {
      updatePayload.deliveredAt = serverTimestamp();
    }

    await updateDoc(orderRef, updatePayload);

    // Audit log
    await logAdminActivity({
      adminId: adminUid,
      adminEmail,
      action: "UPDATE_ORDER_TRACKING",
      entityType: "ORDER",
      entityId: orderId,
      description: `Updated order ${currentData.orderNumber || orderId} tracking: status=${targetStatus}${
        carrier ? `, carrier=${carrier}` : ""
      }${trackingNumber ? `, tracking=${trackingNumber}` : ""}.`,
    });

    return {
      success: true,
      message: `Order tracking updated successfully (${targetStatus.toUpperCase()}).`,
    };
  } catch (error: unknown) {
    console.error("[OrdersService] Failed to update tracking:", error);
    return {
      success: false,
      message: (error as Error)?.message || "Failed to update order tracking.",
    };
  }
}

/**
 * ALLOCATE ORDER TO CUSTOMER ACCOUNT
 *
 * Links an order inquiry to a registered customer's UID.
 * This ensures the customer immediately sees the order and live tracking in /account/orders.
 */
export async function allocateOrderToUser(
  orderId: string,
  targetUserId: string,
  targetUserEmail?: string,
  adminUid?: string,
  adminEmail?: string
): Promise<{ success: boolean; message: string }> {
  if (!orderId || !targetUserId) {
    return { success: false, message: "Order ID and Customer User ID are required." };
  }

  try {
    const db = getFirebaseDb();
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);

    const snap = await getDoc(orderRef);
    if (!snap.exists()) {
      return { success: false, message: "Order not found." };
    }

    const current = snap.data();

    await updateDoc(orderRef, {
      userId: targetUserId.trim(),
      ...(targetUserEmail ? { customerEmail: targetUserEmail.trim() } : {}),
      updatedAt: serverTimestamp(),
    });

    if (adminUid) {
      await logAdminActivity({
        adminId: adminUid,
        adminEmail,
        action: "ALLOCATE_ORDER",
        entityType: "ORDER",
        entityId: orderId,
        description: `Allocated order ${current.orderNumber || orderId} to customer ${targetUserId} (${targetUserEmail || "unspecified email"}).`,
      });
    }

    return {
      success: true,
      message: `Order successfully allocated to customer account.`,
    };
  } catch (error: unknown) {
    console.error("[OrdersService] Failed to allocate order:", error);
    return {
      success: false,
      message: (error as Error)?.message || "Failed to allocate order to customer.",
    };
  }
}
