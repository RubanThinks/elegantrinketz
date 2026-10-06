"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/providers/auth-provider";
import { getUserOrders } from "@/services/orders";
import { formatPrice } from "@/config/constants";
import { siteConfig } from "@/config/site";
import type { Order, OrderStatus } from "@/types";

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchOrders() {
      if (!user?.uid) return;
      setIsLoading(true);
      try {
        const data = await getUserOrders(user.uid);
        if (!ignore) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchOrders();
    return () => {
      ignore = true;
    };
  }, [user?.uid]);

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

  return (
    <div className="py-10 sm:py-14 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with back link */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors text-neutral-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif text-neutral-900 tracking-tight">
                My Orders & Inquiries
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Review your requested pieces, sizing status, and WhatsApp orders.
              </p>
            </div>
          </div>

          <Link href="/shop">
            <Button variant="outline" size="sm" className="text-xs">
              Explore Catalog
            </Button>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-4 border border-neutral-200 rounded-2xl bg-white p-8">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-neutral-800">
                You haven&apos;t placed any orders yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Explore our handcrafted ethnic wear and bespoke pieces, add your favorite styles to bag, and order seamlessly via WhatsApp.
              </p>
            </div>
            <Link href="/shop">
              <Button variant="primary" size="sm" className="text-xs bg-rose-600">
                Discover The Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalItems = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

              return (
                <div
                  key={order.id}
                  className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs transition-shadow hover:shadow-xs"
                >
                  {/* Order Card Header */}
                  <div className="bg-neutral-50/70 p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="font-mono font-bold text-sm text-neutral-900 hover:text-rose-600 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-neutral-500">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {(order.carrier || order.trackingNumber) && (
                        <div className="pt-1 flex items-center gap-2 text-xs text-sky-800 font-medium">
                          <Truck className="w-3.5 h-3.5 text-sky-600" />
                          <span>
                            {order.carrier ? `${order.carrier}` : "Courier"}
                            {order.trackingNumber ? ` • ${order.trackingNumber}` : ""}
                          </span>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-xs text-rose-600 hover:text-rose-700 underline font-semibold ml-1"
                          >
                            Live Tracking &rarr;
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-neutral-400">Total Amount</p>
                      <p className="text-base font-bold text-neutral-900">
                        {typeof order.totalAmount === "number"
                          ? formatPrice(order.totalAmount)
                          : "Confirmed on WhatsApp"}
                      </p>
                    </div>
                  </div>

                  {/* Order Items List */}
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
                                <Package className="w-5 h-5" />
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
                              {item.sizeName && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                                  Size: {item.sizeName}
                                </span>
                              )}
                              <span>Qty: {item.quantity}</span>
                              <span>•</span>
                              <span>{formatPrice(item.price)}</span>
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

                  {/* Order Card Footer */}
                  <div className="bg-neutral-50/40 p-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
                    <p className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>
                        Ordering & payment handled directly with our styling team on WhatsApp.
                      </span>
                    </p>

                    <a
                      href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${siteConfig.name}, I have a question regarding my order ${order.orderNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      <span>Inquire about this order</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <AuthGuard redirectTo="/login">
      <OrdersContent />
    </AuthGuard>
  );
}
