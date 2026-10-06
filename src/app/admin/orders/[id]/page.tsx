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
  Truck,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
  Calendar,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getOrderById,
  confirmOrder,
  cancelOrder,
  updateOrderTracking,
  allocateOrderToUser,
  getCarrierTrackingUrl,
} from "@/services/orders";
import { getRegisteredCustomers } from "@/services/users";
import { getProductById } from "@/services/products";
import { formatPrice } from "@/config/constants";
import { useAuth } from "@/providers/auth-provider";
import type { Order, OrderStatus, UserProfile } from "@/types";

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

  const [isConfirming, setIsConfirming] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Tracking Management States
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackStatus, setTrackStatus] = useState<OrderStatus>("confirmed");
  const [trackCarrier, setTrackCarrier] = useState("");
  const [customCarrier, setCustomCarrier] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [trackEstimatedDelivery, setTrackEstimatedDelivery] = useState("");
  const [trackNote, setTrackNote] = useState("");
  const [trackLocation, setTrackLocation] = useState("");
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [copiedTrack, setCopiedTrack] = useState(false);

  // Customer Allocation States
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [customersList, setCustomersList] = useState<UserProfile[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [manualUserUid, setManualUserUid] = useState("");
  const [manualUserEmail, setManualUserEmail] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);

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

  const handleOpenTrackingModal = () => {
    if (!order) return;
    setTrackStatus(order.status || "confirmed");
    setTrackCarrier(order.carrier || "Delhivery");
    setCustomCarrier(
      order.carrier && !["Delhivery", "Blue Dart", "DTDC", "India Post", "FedEx", "DHL", "Ecom Express"].includes(order.carrier)
        ? order.carrier
        : ""
    );
    setTrackNumber(order.trackingNumber || "");
    setTrackUrl(order.trackingUrl || "");
    setTrackEstimatedDelivery(
      order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().slice(0, 10) : ""
    );
    setTrackNote("");
    setTrackLocation("");
    setShowTrackingModal(true);
  };

  const handleTrackingCarrierSelect = (carrier: string) => {
    setTrackCarrier(carrier);
    if (carrier !== "Other") {
      const generated = getCarrierTrackingUrl(carrier, trackNumber);
      if (generated) setTrackUrl(generated);
    }
  };

  const handleTrackingNumberChange = (num: string) => {
    setTrackNumber(num);
    const activeCarrier = trackCarrier === "Other" ? customCarrier : trackCarrier;
    if (activeCarrier) {
      const generated = getCarrierTrackingUrl(activeCarrier, num);
      if (generated) setTrackUrl(generated);
    }
  };

  const copyTrackingToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTrack(true);
      setTimeout(() => setCopiedTrack(false), 2000);
    }
  };

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;
    setIsUpdatingTracking(true);
    setFeedbackMessage(null);

    const activeCarrier = trackCarrier === "Other" ? customCarrier.trim() : trackCarrier.trim();
    const result = await updateOrderTracking({
      orderId: order.id,
      adminUid: user.uid,
      adminEmail: user.email || undefined,
      status: trackStatus,
      carrier: activeCarrier || undefined,
      trackingNumber: trackNumber.trim() || undefined,
      trackingUrl: trackUrl.trim() || undefined,
      estimatedDelivery: trackEstimatedDelivery ? new Date(trackEstimatedDelivery).toISOString() : undefined,
      trackingNote: trackNote.trim() || undefined,
      location: trackLocation.trim() || undefined,
    });

    setIsUpdatingTracking(false);
    if (result.success) {
      setShowTrackingModal(false);
      setFeedbackMessage({ type: "success", text: result.message });
      loadOrder();
    } else {
      setFeedbackMessage({ type: "error", text: result.message });
    }
  };

  const handleOpenAllocateModal = async () => {
    setShowAllocateModal(true);
    setSelectedCustomerId(order?.userId || "");
    setManualUserUid("");
    setManualUserEmail("");
    setIsLoadingCustomers(true);
    try {
      const list = await getRegisteredCustomers(50);
      setCustomersList(list);
    } catch (err) {
      console.error("Failed to load customer list:", err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;

    let targetUid = "";
    let targetEmail = "";

    if (selectedCustomerId === "manual") {
      targetUid = manualUserUid.trim();
      targetEmail = manualUserEmail.trim();
      if (!targetUid) {
        setFeedbackMessage({ type: "error", text: "Customer UID is required for manual assignment." });
        return;
      }
    } else if (selectedCustomerId) {
      const found = customersList.find((c) => c.uid === selectedCustomerId);
      if (found) {
        targetUid = found.uid;
        targetEmail = found.email || "";
      }
    }

    if (!targetUid) {
      setFeedbackMessage({ type: "error", text: "Please select or enter a valid customer account." });
      return;
    }

    setIsAllocating(true);
    setFeedbackMessage(null);

    const result = await allocateOrderToUser(
      order.id,
      targetUid,
      targetEmail || undefined,
      user.uid
    );

    setIsAllocating(false);
    if (result.success) {
      setShowAllocateModal(false);
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
              {order.status === "processing" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  Processing in Atelier
                </span>
              )}
              {order.status === "shipped" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                  <Truck className="w-3.5 h-3.5 text-sky-600" />
                  Shipped & In Transit
                </span>
              )}
              {order.status === "delivered" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Delivered
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

      {/* Shipped & In Transit Banner */}
      {order.status === "shipped" && (
        <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/70 text-sky-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="font-bold flex items-center gap-1.5 text-sky-900">
              <Truck className="w-4 h-4 text-sky-600" />
              <span>Package Dispatched &amp; In Transit</span>
            </p>
            <p className="text-sky-800">
              {order.carrier ? `Carrier: ${order.carrier}` : "Carrier assigned"}{" "}
              {order.trackingNumber && `• AWB: ${order.trackingNumber}`}
              {order.estimatedDelivery && ` • Expected Delivery: ${order.estimatedDelivery}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTrackingModal}
            className="text-xs bg-white text-sky-900 border-sky-300 hover:bg-sky-100 self-start sm:self-auto cursor-pointer"
          >
            Update Tracking Info
          </Button>
        </div>
      )}

      {/* Delivered Banner */}
      {order.status === "delivered" && (
        <div className="p-4 rounded-xl border border-teal-300 bg-teal-50/70 text-teal-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="font-bold flex items-center gap-1.5 text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Order Delivered to Customer</span>
            </p>
            <p className="text-teal-800">
              Package marked as safely delivered.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTrackingModal}
            className="text-xs bg-white text-teal-900 border-teal-300 hover:bg-teal-100 self-start sm:self-auto cursor-pointer"
          >
            Edit Tracking Details
          </Button>
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
        {/* Left Column: Order Fulfillment & Tracking Control Center + Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Fulfillment & Courier Tracking Card */}
          <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-neutral-800" />
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    Fulfillment &amp; Courier Tracking
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    Updates made here are reflected live on the customer&apos;s account portal.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenTrackingModal}
                disabled={order.status === "cancelled"}
                className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Update Tracking &amp; Status</span>
              </Button>
            </div>

            {/* Tracking Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Courier / Carrier
                </span>
                <p className="font-semibold text-neutral-900 truncate">
                  {order.carrier || "Not assigned"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Tracking / AWB
                </span>
                <div className="flex items-center gap-1.5">
                  <p className="font-mono font-semibold text-neutral-900 truncate">
                    {order.trackingNumber || "—"}
                  </p>
                  {order.trackingNumber && (
                    <button
                      type="button"
                      onClick={() => copyTrackingToClipboard(order.trackingNumber!)}
                      className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                      title="Copy Tracking Number"
                    >
                      {copiedTrack ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Est. Delivery
                </span>
                <p className="font-semibold text-neutral-900 truncate">
                  {order.estimatedDelivery || "Not specified"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Tracking Portal
                </span>
                <div>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <span>Track Package</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-neutral-400">No URL</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking History Timeline */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Milestone Timeline ({order.trackingHistory.length})
                </h3>
                <div className="space-y-2">
                  {order.trackingHistory
                    .slice()
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900">{item.title}</span>
                            {item.location && (
                              <span className="text-[10px] text-neutral-500 bg-neutral-200/60 px-1.5 py-0.5 rounded">
                                {item.location}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-neutral-600 text-[11px]">{item.description}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {new Date(item.timestamp).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
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

              {/* Customer Account Allocation */}
              <div>
                <p className="text-neutral-400 text-[11px] uppercase tracking-wider">
                  Customer Account Allocation
                </p>
                {order.userId ? (
                  <div className="mt-1 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[140px] font-mono text-[11px]">
                        UID: {order.userId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAllocateModal}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                    >
                      Reallocate
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                    <span className="text-amber-800 text-[11px] font-medium">
                      Guest / Not Allocated
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenAllocateModal}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                    >
                      Allocate Account
                    </button>
                  </div>
                )}
              </div>
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

      {/* Tracking & Fulfillment Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-rose-600" />
                  <span>Update Order Tracking &amp; Status</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                  {order.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTrackingModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTrackingSubmit} className="space-y-3.5 text-xs">
              {/* Order Status */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Order Status *
                </label>
                <select
                  value={trackStatus}
                  onChange={(e) => setTrackStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white focus:outline-none focus:border-rose-600 font-medium"
                >
                  <option value="confirmed">Confirmed &amp; Stock Deducted</option>
                  <option value="processing">Processing / Crafting in Atelier</option>
                  <option value="shipped">Shipped &amp; In Transit</option>
                  <option value="delivered">Delivered to Customer</option>
                </select>
              </div>

              {/* Carrier Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Courier / Carrier
                  </label>
                  <select
                    value={trackCarrier}
                    onChange={(e) => handleTrackingCarrierSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white focus:outline-none focus:border-rose-600"
                  >
                    <option value="Delhivery">Delhivery</option>
                    <option value="Blue Dart">Blue Dart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="India Post">India Post</option>
                    <option value="FedEx">FedEx</option>
                    <option value="DHL">DHL</option>
                    <option value="Ecom Express">Ecom Express</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>

                {trackCarrier === "Other" && (
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Custom Carrier Name
                    </label>
                    <input
                      type="text"
                      value={customCarrier}
                      onChange={(e) => setCustomCarrier(e.target.value)}
                      placeholder="e.g. Professional Couriers"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Tracking / AWB Number
                  </label>
                  <input
                    type="text"
                    value={trackNumber}
                    onChange={(e) => handleTrackingNumberChange(e.target.value)}
                    placeholder="e.g. DEL789123456"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono text-neutral-900 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Tracking URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700">
                    Carrier Tracking Web URL
                  </label>
                  {trackCarrier && trackNumber && (
                    <button
                      type="button"
                      onClick={() => {
                        const finalC = trackCarrier === "Other" ? customCarrier : trackCarrier;
                        const gen = getCarrierTrackingUrl(finalC, trackNumber);
                        if (gen) setTrackUrl(gen);
                      }}
                      className="text-[10px] text-rose-600 hover:text-rose-700 underline font-medium cursor-pointer"
                    >
                      Generate Carrier Link
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={trackUrl}
                  onChange={(e) => setTrackUrl(e.target.value)}
                  placeholder="https://www.delhivery.com/track/package/..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600 font-mono text-xs"
                />
              </div>

              {/* Estimated Delivery & Current Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={trackEstimatedDelivery}
                    onChange={(e) => setTrackEstimatedDelivery(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Current Location / Hub
                  </label>
                  <input
                    type="text"
                    value={trackLocation}
                    onChange={(e) => setTrackLocation(e.target.value)}
                    placeholder="e.g. Mumbai Regional Sorting Hub"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Milestone Note */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Milestone Note (Shown to Customer)
                </label>
                <input
                  type="text"
                  value={trackNote}
                  onChange={(e) => setTrackNote(e.target.value)}
                  placeholder="e.g. Dispatched from Atelier; expected delivery within 3-4 days."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTrackingModal(false)}
                  disabled={isUpdatingTracking}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingTracking}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingTracking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Save Tracking &amp; Notify Portal</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Allocation Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-600" />
                  <span>Allocate Order to Customer Account</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Allocates order {order.orderNumber} to a registered user account so they can track it in /account/orders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
              {/* Select Registered Customer */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Select Registered Customer
                </label>
                {isLoadingCustomers ? (
                  <p className="text-neutral-400 italic">Loading registered users...</p>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white focus:outline-none focus:border-rose-600"
                  >
                    <option value="">-- Choose from Registered Shoppers --</option>
                    {customersList.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.displayName || "Customer"} ({c.email || c.phone || c.uid.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                <div className="h-px bg-neutral-200 flex-1" />
                <span>OR SPECIFY DIRECT UID</span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Customer User UID
                </label>
                <input
                  type="text"
                  value={manualUserUid}
                  onChange={(e) => setManualUserUid(e.target.value)}
                  placeholder="e.g. Firebase Auth UID"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono text-neutral-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Customer Email (Optional verification)
                </label>
                <input
                  type="email"
                  value={manualUserEmail}
                  onChange={(e) => setManualUserEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllocateModal(false)}
                  disabled={isAllocating}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAllocating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
                >
                  {isAllocating ? "Allocating..." : "Allocate Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
