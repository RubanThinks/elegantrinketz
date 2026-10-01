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
