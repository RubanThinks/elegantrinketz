"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Package,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getOrderById,
  confirmOrder,
  cancelOrder,
} from "@/services/orders";
import { getProductById } from "@/services/products";
import { formatPrice } from "@/config/constants";
import { useAuth } from "@/providers/auth-provider";
import type { Order, OrderStatus } from "@/types";

interface StockCheckItem {
  productId: string;
  productName: string;
  sizeName: string | null;
  requestedQty: number;
  availableStock: number;
  isSufficient: boolean;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stockChecks, setStockChecks] = useState<StockCheckItem[]>([]);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  // Action states
  const [isConfirming, setIsConfirming] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const checkLiveStock = useCallback(async (currentOrder: Order) => {
    setIsCheckingStock(true);
    try {
      const checks: StockCheckItem[] = [];
      for (const item of currentOrder.items) {
        const prod = await getProductById(item.productId);
        if (!prod) {
          checks.push({
            productId: item.productId,
            productName: item.name,
            sizeName: item.sizeName || null,
            requestedQty: item.quantity,
            availableStock: 0,
            isSufficient: false,
          });
          continue;
        }

        const sizeVariant = prod.sizes?.find(
          (s) =>
            s.id === item.sizeId ||
            s.name === item.sizeName ||
            s.name === item.sizeId
        );
        const available = sizeVariant
          ? sizeVariant.stock
          : prod.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;

        checks.push({
          productId: item.productId,
          productName: prod.name,
          sizeName: sizeVariant?.name || item.sizeName || null,
          requestedQty: item.quantity,
          availableStock: available,
          isSufficient: available >= item.quantity,
        });
      }
      setStockChecks(checks);
    } catch (err) {
      console.error("Live stock check error:", err);
    } finally {
      setIsCheckingStock(false);
    }
  }, []);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);

      if (data && data.status === "pending") {
        checkLiveStock(data);
      }
    } catch (err) {
      console.error("[AdminOrderDetail] Failed to fetch order:", err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, checkLiveStock]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      if (!orderId) return;
      try {
        const data = await getOrderById(orderId);
        if (!ignore) {
          setOrder(data);
          if (data && data.status === "pending") {
            checkLiveStock(data);
          }
        }
      } catch (err) {
        console.error("[AdminOrderDetail] Failed to fetch order:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [orderId, checkLiveStock]);

  const handleConfirmOrder = async () => {
    if (!order || !user) return;
    if (
      !confirm(
        "Confirming this order will ATOMICALLY deduct the required quantities from inventory. Proceed?"
      )
    ) {
      return;
    }

    setIsConfirming(true);
    setFeedbackMessage(null);

    const result = await confirmOrder(order.id, user.uid, user.email || undefined);
    setIsConfirming(false);

    if (result.success) {
      setFeedbackMessage({ type: "success", text: result.message });
      loadOrder();
    } else {
      setFeedbackMessage({ type: "error", text: result.message });
    }
  };

  const handleCancelOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;

    setIsCancelling(true);
    setFeedbackMessage(null);

    const result = await cancelOrder(
      order.id,
      user.uid,
      cancelReason.trim() || "Cancelled by admin",
      user.email || undefined
    );
    setIsCancelling(false);
    setShowCancelModal(false);

    if (result.success) {
      setFeedbackMessage({ type: "success", text: result.message });
      loadOrder();
    } else {
      setFeedbackMessage({ type: "error", text: result.message });
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900">Order Not Found</h2>
        <p className="text-xs text-neutral-500">
          The requested order does not exist or may have been deleted.
        </p>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const allItemsStockAvailable =
    stockChecks.length > 0 && stockChecks.every((c) => c.isSufficient);

  const cleanCustomerPhone = order.customerPhone.replace(/[^0-9]/g, "");
  const customerWhatsAppLink = cleanCustomerPhone
    ? `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(
        `Hello ${order.customerName}, this is regarding your order ${order.orderNumber} with Atelier.`
      )}`
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors text-neutral-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-neutral-900">
                {order.orderNumber}
              </h1>
              {order.status === "pending" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending Confirmation
                </span>
              )}
              {order.status === "confirmed" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Confirmed & Stock Deducted
                </span>
              )}
              {order.status === "cancelled" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                  Cancelled
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Created on{" "}
              {new Date(order.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customerWhatsAppLink && (
            <a
              href={customerWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#1da851] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp Customer</span>
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrder}
            disabled={isLoading}
            className="text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-neutral-500 hover:text-neutral-800 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Order Action Banner for Pending Order */}
      {order.status === "pending" && (
        <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50/70 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Admin Confirmation & Atomic Inventory Deduction</span>
              </h2>
              <p className="text-xs text-amber-900 leading-relaxed font-light">
                Once customer payment or sizing is confirmed over WhatsApp, confirm this order to automatically deduct product stock across all ordered variants.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmOrder}
                disabled={isConfirming || isCheckingStock || !allItemsStockAvailable}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isConfirming ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deducting Stock...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Order & Deduct Stock</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="border-neutral-300 text-neutral-700 hover:text-red-600 hover:border-red-300 text-xs cursor-pointer"
              >
                Cancel Order
              </Button>
            </div>
          </div>

          {/* Pre-flight Live Stock Check Table */}
          <div className="pt-2 border-t border-amber-200/80">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 mb-2">
              <span>Live Inventory Sufficiency Check</span>
              {isCheckingStock && (
                <span className="text-neutral-500 font-normal">Checking live catalog stock...</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {stockChecks.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    item.isSufficient
                      ? "bg-white border-emerald-200 text-neutral-800"
                      : "bg-red-50 border-red-300 text-red-900"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold truncate">{item.productName}</p>
                    <p className="text-[11px] text-neutral-500">
                      Size: {item.sizeName || "Standard"} • Req: {item.requestedQty}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {item.isSufficient ? (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {item.availableStock} in stock
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-red-700">
                        Only {item.availableStock} left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Banner with Policy Notice */}
      {order.status === "confirmed" && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-950 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Order Confirmed & Inventory Deducted</span>
          </p>
          <p className="text-emerald-800">
            Confirmed by admin {order.confirmedBy || "system"} on{" "}
            {order.confirmedAt
              ? new Date(order.confirmedAt).toLocaleString("en-IN")
              : "record"}
            .
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-neutral-500 text-[11px] border-t border-emerald-200/60 mt-2">
            <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>
              Confirmed-order cancellation/restocking workflow is not yet implemented. Confirmed orders cannot be cancelled in this phase.
            </span>
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {order.status === "cancelled" && (
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 text-xs space-y-1">
          <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-neutral-500" />
            <span>Order Cancelled</span>
          </p>
          <p>
            Reason: <span className="font-medium">{order.cancelReason || "No reason specified"}</span>
          </p>
          {order.cancelledAt && (
            <p className="text-neutral-400">
              Cancelled on {new Date(order.cancelledAt).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Order Items & Financials (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items Table */}
          <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-500" />
                <span>Ordered Items ({order.items?.length || 0})</span>
              </h2>
              {order.inventoryDeducted && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Inventory Deducted
                </span>
              )}
            </div>

            <div className="divide-y divide-neutral-100">
              {order.items?.map((item, idx) => {
                const lineTotal = item.lineTotal || (item.price || 0) * (item.quantity || 1);
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-18 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <Link
                          href={`/products/${item.slug || item.productId}`}
                          target="_blank"
                          className="font-semibold text-neutral-900 hover:text-rose-600 text-xs sm:text-sm line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.sku && item.sizeName && <span>•</span>}
                          {item.sizeName && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                              Size: {item.sizeName}
                            </span>
                          )}
                          <span>•</span>
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>{formatPrice(item.price)} each</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-neutral-400">Total</p>
                      <p className="text-sm font-bold text-neutral-900">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="bg-neutral-50/80 px-5 py-4 border-t border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  {typeof order.totalAmount === "number"
                    ? formatPrice(order.totalAmount)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Payment Channel</span>
                <span>WhatsApp Atelier Direct (No Gateway)</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline text-sm">
                <span className="font-bold text-neutral-900">Total Amount</span>
                <span className="text-lg font-bold text-neutral-950 font-mono">
                  {typeof order.totalAmount === "number"
                    ? formatPrice(order.totalAmount)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details & Audit Trail (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Details Card */}
          <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <User className="w-4 h-4 text-neutral-500" />
              <span>Customer Details</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Name</p>
                <p className="font-semibold text-neutral-900 text-sm mt-0.5">
                  {order.customerName}
                </p>
              </div>

              <div>
                <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Phone</p>
                <p className="font-mono text-neutral-800 mt-0.5">
                  {order.customerPhone || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Email</p>
                <p className="text-neutral-800 mt-0.5">{order.customerEmail || "Not provided"}</p>
              </div>

              {order.userId && (
                <div>
                  <p className="text-neutral-400 text-[11px] uppercase tracking-wider">
                    Customer Account
                  </p>
                  <p className="text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Registered User</span>
                  </p>
                </div>
              )}
            </div>

            {customerWhatsAppLink && (
              <div className="pt-2">
                <a
                  href={customerWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#1da851] text-white transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Open WhatsApp Chat</span>
                </a>
              </div>
            )}
          </div>

          {/* Delivery & Notes Card */}
          {(order.shippingAddress || order.notes) && (
            <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>Shipping & Notes</span>
              </h2>

              {order.shippingAddress && (
                <div className="text-xs text-neutral-700 space-y-1">
                  <p className="font-semibold text-neutral-900">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              )}

              {order.notes && (
                <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  <p className="font-semibold text-neutral-800 mb-1">Conversation Notes:</p>
                  <p className="italic">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Audit & Verification Card */}
          <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span>Audit Trail</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Created At</span>
                <span className="font-medium text-neutral-800">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              {order.confirmedAt && (
                <div className="flex justify-between text-neutral-600">
                  <span>Confirmed At</span>
                  <span className="font-medium text-emerald-800">
                    {new Date(order.confirmedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}

              {order.confirmedBy && (
                <div className="flex justify-between text-neutral-600">
                  <span>Confirmed By</span>
                  <span className="font-mono text-neutral-700 text-[10px] truncate max-w-[120px]">
                    {order.confirmedBy}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Channel</span>
                <span className="font-medium text-neutral-800">
                  {order.whatsappInitiated ? "WhatsApp Manual Entry" : "Admin Direct"}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Inventory Status</span>
                <span
                  className={`font-semibold ${
                    order.inventoryDeducted ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {order.inventoryDeducted ? "Deducted" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal (for Pending orders only) */}
      {showCancelModal && order.status === "pending" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-neutral-900">
                Cancel Pending Order {order.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Cancelling this pending order will mark it as cancelled. Because stock has not been deducted, no inventory changes will occur.
            </p>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer cancelled on WhatsApp, Changed mind on sizing..."
                  rows={3}
                  className="w-full p-3 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCancelling}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs cursor-pointer"
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
