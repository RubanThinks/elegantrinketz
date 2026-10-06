"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  MapPin,
  FileText,
  Truck,
  Copy,
  Check,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/providers/auth-provider";
import { getOrderById } from "@/services/orders";
import { formatPrice } from "@/config/constants";
import { siteConfig } from "@/config/site";
import type { Order, OrderStatus } from "@/types";

function OrderDetailContent() {
  const params = useParams();
  const orderId = params?.id as string;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [copiedTrack, setCopiedTrack] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchOrder() {
      if (!orderId || !user?.uid) return;
      setIsLoading(true);
      try {
        const data = await getOrderById(orderId);
        if (!ignore) {
          if (!data) {
            setOrder(null);
          } else if (data.userId && data.userId !== user.uid) {
            // Customer isolation: cannot access other users' orders
            setIsUnauthorized(true);
            setOrder(null);
          } else {
            setOrder(data);
          }
        }
      } catch (err) {
        console.error("Failed to load customer order:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchOrder();
    return () => {
      ignore = true;
    };
  }, [orderId, user?.uid]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Confirmation
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Order Confirmed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            Processing in Atelier
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            Shipped &amp; In Transit
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-neutral-400" />
            Cancelled
          </span>
        );
      default:
        return <span className="text-xs text-neutral-600">{status}</span>;
    }
  };

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTrack(true);
    setTimeout(() => setCopiedTrack(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading order details...</p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900">Access Restricted</h2>
        <p className="text-xs text-neutral-500 leading-relaxed">
          You do not have permission to view this order. Customer order records are strictly private.
        </p>
        <Link href="/account/orders">
          <Button variant="outline" size="sm" className="text-xs">
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
        <h2 className="text-lg font-bold text-neutral-900">Order Not Found</h2>
        <p className="text-xs text-neutral-500">
          The requested order inquiry does not exist or may have been removed.
        </p>
        <Link href="/account/orders">
          <Button variant="outline" size="sm" className="text-xs">
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors text-neutral-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-mono text-neutral-900">
                  {order.orderNumber}
                </h1>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hello ${siteConfig.name}, I am inquiring regarding my order ${order.orderNumber}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#1da851] text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* 5-Step Order Progress Stepper */}
        {order.status !== "cancelled" ? (
          <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-rose-600" />
                <span>Order Journey &amp; Fulfillment Status</span>
              </h2>
              {order.estimatedDelivery && (
                <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Est. Delivery: {order.estimatedDelivery}</span>
                </span>
              )}
            </div>

            {(() => {
              const stages = [
                { id: "pending", label: "Placed", desc: "Order Received" },
                { id: "confirmed", label: "Confirmed", desc: "Inventory Reserved" },
                { id: "processing", label: "In Atelier", desc: "Handcrafted & Tailored" },
                { id: "shipped", label: "Dispatched", desc: "In Transit" },
                { id: "delivered", label: "Delivered", desc: "Safely Received" },
              ];

              const statusOrder: Record<OrderStatus, number> = {
                pending: 0,
                confirmed: 1,
                processing: 2,
                shipped: 3,
                delivered: 4,
                cancelled: -1,
              };

              const currentIdx = statusOrder[order.status] ?? 0;

              return (
                <div className="pt-2">
                  <div className="grid grid-cols-5 gap-1 relative">
                    {/* Connecting progress bar */}
                    <div className="absolute top-3.5 left-[10%] right-[10%] h-0.5 bg-neutral-200 -z-0">
                      <div
                        className="h-full bg-neutral-900 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, (currentIdx / 4) * 100))}%`,
                        }}
                      />
                    </div>

                    {stages.map((stage, idx) => {
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={stage.id} className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? "bg-neutral-900 text-white"
                                : isCurrent
                                ? "bg-rose-600 text-white ring-4 ring-rose-100"
                                : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-semibold mt-2 ${
                              isCurrent
                                ? "text-rose-600"
                                : isCompleted
                                ? "text-neutral-900"
                                : "text-neutral-400"
                            }`}
                          >
                            {stage.label}
                          </span>
                          <span className="text-[10px] text-neutral-400 hidden sm:block">
                            {stage.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-2xl bg-neutral-50 p-5 space-y-1.5 text-xs text-neutral-700">
            <div className="flex items-center gap-2 font-bold text-neutral-900">
              <XCircle className="w-4 h-4 text-neutral-500" />
              <span>This order has been cancelled</span>
            </div>
            {order.cancelReason && (
              <p className="text-neutral-600">
                Reason: <span className="font-medium">{order.cancelReason}</span>
              </p>
            )}
            {order.cancelledAt && (
              <p className="text-neutral-400">
                Date: {new Date(order.cancelledAt).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        )}

        {/* Live Courier Tracking Card */}
        {order.status !== "cancelled" && (
          <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-700" />
                <h2 className="text-sm font-bold text-neutral-900">
                  Live Courier Tracking &amp; Dispatch Details
                </h2>
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <span>Track on {order.carrier || "Courier"} Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {order.trackingNumber || order.carrier ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      Assigned Courier
                    </span>
                    <p className="font-semibold text-neutral-900">
                      {order.carrier || "Standard Air Delivery"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      AWB / Tracking Number
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold text-neutral-900">
                        {order.trackingNumber || "—"}
                      </p>
                      {order.trackingNumber && (
                        <button
                          type="button"
                          onClick={() => copyTracking(order.trackingNumber!)}
                          className="text-neutral-400 hover:text-neutral-800 p-0.5 cursor-pointer"
                          title="Copy tracking number"
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
                      Expected Arrival
                    </span>
                    <p className="font-semibold text-neutral-900">
                      {order.estimatedDelivery || "To be updated upon dispatch"}
                    </p>
                  </div>
                </div>

                {/* Tracking Milestones History */}
                {order.trackingHistory && order.trackingHistory.length > 0 && (
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Tracking Milestones ({order.trackingHistory.length})
                    </h3>
                    <div className="space-y-2">
                      {order.trackingHistory
                        .slice()
                        .reverse()
                        .map((milestone, idx) => (
                          <div
                            key={milestone.id || idx}
                            className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-900">
                                  {milestone.title}
                                </span>
                                {milestone.location && (
                                  <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">
                                    {milestone.location}
                                  </span>
                                )}
                              </div>
                              {milestone.description && (
                                <p className="text-neutral-600 text-[11px]">
                                  {milestone.description}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                              {new Date(milestone.timestamp).toLocaleString("en-IN", {
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
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-3 text-xs text-neutral-600">
                <Sparkles className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="leading-relaxed">
                  Your bespoke pieces are currently being carefully examined and packaged in our atelier. Real-time courier waybill details and tracking links will appear here immediately once handed over for transit.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order Details Card */}
        <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-neutral-500" />
              <span>Items in this Order ({order.items?.length || 0})</span>
            </h2>
            <span className="text-xs text-neutral-500">
              Total: {formatPrice(order.totalAmount || 0)}
            </span>
          </div>

          <div className="divide-y divide-neutral-100 p-4 sm:p-5 space-y-4">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 pt-3 first:pt-0"
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
                      className="font-medium text-xs sm:text-sm text-neutral-900 hover:text-rose-600 transition-colors line-clamp-1"
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
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>{formatPrice(item.price)} each</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-neutral-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Notes or instructions */}
          {order.notes && (
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-600">
              <span className="font-semibold text-neutral-800">Special Sizing Notes: </span>
              <span>{order.notes}</span>
            </div>
          )}

          <div className="bg-neutral-50/70 p-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
            <p>
              Fulfillment, custom alterations, and shipping details are confirmed on WhatsApp.
            </p>
            <span className="font-mono font-bold text-neutral-900 text-sm">
              Subtotal: {formatPrice(order.totalAmount || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  return (
    <AuthGuard redirectTo="/login">
      <OrderDetailContent />
    </AuthGuard>
  );
}
