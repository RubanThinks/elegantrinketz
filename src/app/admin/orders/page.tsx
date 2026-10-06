"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  ArrowRight,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminOrders, createAdminOrder, type CreateAdminOrderItemInput } from "@/services/orders";
import { getAdminProducts } from "@/services/products";
import { getRegisteredCustomers } from "@/services/users";
import { formatPrice } from "@/config/constants";
import { useAuth } from "@/providers/auth-provider";
import type { Order, OrderStatus, Product, UserProfile } from "@/types";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");

  // Create Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [registeredCustomers, setRegisteredCustomers] = useState<UserProfile[]>([]);

  // Form Fields for Manual Order Creation
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [formItems, setFormItems] = useState<
    Array<{
      productId: string;
      sizeId: string;
      sizeName: string;
      quantity: number;
      unitPrice: number;
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminOrders({
        status: selectedStatus,
        search: activeSearch,
        maxLimit: 100,
      });
      setOrders(data);
    } catch (err) {
      console.error("[AdminOrdersPage] Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, activeSearch]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const data = await getAdminOrders({
          status: selectedStatus,
          search: activeSearch,
          maxLimit: 100,
        });
        if (!ignore) {
          setOrders(data);
        }
      } catch (err) {
        console.error("[AdminOrdersPage] Failed to fetch orders:", err);
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
  }, [selectedStatus, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const openCreateModal = async () => {
    setIsCreateModalOpen(true);
    setCreateError(null);
    setCreateSuccess(null);
    setSelectedUserId("");
    setIsCatalogLoading(true);
    try {
      const [prodRes, userRes] = await Promise.all([
        productsCatalog.length === 0 ? getAdminProducts({ pageSize: 100 }) : Promise.resolve(null),
        registeredCustomers.length === 0 ? getRegisteredCustomers(100) : Promise.resolve(null),
      ]);
      if (prodRes) setProductsCatalog(prodRes.products);
      if (userRes) setRegisteredCustomers(userRes);
    } catch (err) {
      console.error("Failed to load catalog or customers for order creation:", err);
    } finally {
      setIsCatalogLoading(false);
    }
  };

  const handleCustomerSelect = (uid: string) => {
    setSelectedUserId(uid);
    if (!uid) return;
    const match = registeredCustomers.find((c) => c.uid === uid);
    if (match) {
      if (match.displayName) setCustName(match.displayName);
      if (match.phone) setCustPhone(match.phone);
      if (match.email) setCustEmail(match.email);
    }
  };

  const handleAddLineItem = () => {
    if (productsCatalog.length === 0) return;
    const defaultProd = productsCatalog[0];
    const defaultSize = defaultProd.sizes?.[0];
    setFormItems([
      ...formItems,
      {
        productId: defaultProd.id,
        sizeId: defaultSize?.id || "",
        sizeName: defaultSize?.name || "",
        quantity: 1,
        unitPrice: defaultProd.price,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setFormItems(formItems.filter((_, idx) => idx !== index));
  };

  const handleItemProductChange = (index: number, newProductId: string) => {
    const prod = productsCatalog.find((p) => p.id === newProductId);
    if (!prod) return;
    const updated = [...formItems];
    const defaultSize = prod.sizes?.[0];
    updated[index] = {
      productId: prod.id,
      sizeId: defaultSize?.id || "",
      sizeName: defaultSize?.name || "",
      quantity: updated[index].quantity,
      unitPrice: prod.price,
    };
    setFormItems(updated);
  };

  const handleItemSizeChange = (index: number, newSizeId: string) => {
    const updated = [...formItems];
    const prod = productsCatalog.find((p) => p.id === updated[index].productId);
    const size = prod?.sizes?.find((s) => s.id === newSizeId);
    updated[index] = {
      ...updated[index],
      sizeId: newSizeId,
      sizeName: size?.name || newSizeId,
    };
    setFormItems(updated);
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    const updated = [...formItems];
    updated[index] = {
      ...updated[index],
      quantity: Math.max(1, qty),
    };
    setFormItems(updated);
  };

  const handleItemPriceChange = (index: number, price: number) => {
    const updated = [...formItems];
    updated[index] = {
      ...updated[index],
      unitPrice: Math.max(0, price),
    };
    setFormItems(updated);
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreateError(null);
    setCreateSuccess(null);

    if (formItems.length === 0) {
      setCreateError("Please add at least one line item to create an order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload: CreateAdminOrderItemInput[] = formItems.map((fi) => ({
        productId: fi.productId,
        sizeId: fi.sizeId || null,
        sizeName: fi.sizeName || null,
        quantity: fi.quantity,
        unitPrice: fi.unitPrice,
      }));

      const res = await createAdminOrder({
        customerName: custName,
        customerPhone: custPhone,
        customerEmail: custEmail || null,
        userId: selectedUserId || null,
        items: itemsPayload,
        notes: orderNotes,
        adminUid: user.uid,
        adminEmail: user.email || undefined,
      });

      if (res.success) {
        setCreateSuccess(`Order ${res.orderNumber} created in 'pending' status.`);
        // Reset form
        setCustName("");
        setCustPhone("");
        setCustEmail("");
        setOrderNotes("");
        setFormItems([]);
        loadOrders();
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setCreateSuccess(null);
        }, 1500);
      } else {
        setCreateError(res.message);
      }
    } catch (err: unknown) {
      setCreateError((err as Error)?.message || "Failed to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics summary
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Confirmation
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmed & Deducted
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            <RefreshCw className="w-3 h-3 text-indigo-600" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3 text-sky-600" />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-neutral-400" />
            Cancelled
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-neutral-800" />
            <span>Admin Orders & Enquiries</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manually create orders from WhatsApp chats, review pending requests, and confirm with atomic inventory deduction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={isLoading}
            className="text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
            Total Orders
          </p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900">{totalCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold">
              Pending Confirmation
            </p>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-900">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-emerald-800 font-semibold">
            Confirmed & Deducted
          </p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900">{confirmedCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
            Cancelled Orders
          </p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900">{cancelledCount}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number (e.g. ORD-), customer name, phone, or email..."
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="text-xs">
            Search
          </Button>
          {activeSearch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setActiveSearch("");
              }}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Status Filter:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "confirmed", label: "Confirmed" },
              { id: "processing", label: "Processing" },
              { id: "shipped", label: "Shipped" },
              { id: "delivered", label: "Delivered" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id as OrderStatus | "all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedStatus === tab.id
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin mx-auto mb-2" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-800">No orders found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {activeSearch || selectedStatus !== "all"
                ? "No orders match your filter criteria. Try adjusting your search term."
                : "No customer orders have been recorded yet. Click 'Create Order' above to manually record an order received on WhatsApp."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              className="text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Order
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 text-[10px] uppercase font-bold text-neutral-500 tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items Summary</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => {
                  const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                  const firstItem = order.items?.[0];
                  const extraItems = (order.items?.length || 0) - 1;

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:text-rose-600 transition-colors flex items-center gap-1.5"
                        >
                          <span>{order.orderNumber}</span>
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-neutral-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <div className="text-[10px] text-neutral-400">
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-neutral-900">{order.customerName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {order.customerPhone || order.customerEmail || "WhatsApp Direct"}
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-3">
                        <div className="text-neutral-900 font-medium truncate max-w-xs">
                          {firstItem ? (
                            <span>
                              {firstItem.quantity}x {firstItem.name}
                              {firstItem.sizeName && ` (${firstItem.sizeName})`}
                              {extraItems > 0 && (
                                <span className="text-neutral-500 font-normal">
                                  {" "}
                                  +{extraItems} more
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-neutral-400">No items</span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {itemCount} {itemCount === 1 ? "unit" : "units"} total
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3 font-semibold text-neutral-900">
                        {typeof order.totalAmount === "number"
                          ? formatPrice(order.totalAmount)
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs hover:border-neutral-400 gap-1.5 cursor-pointer"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3 text-neutral-400" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-rose-600" />
                  <span>Create Pending Order (Admin Manual Entry)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Record details received from customer via WhatsApp. Creates order in &apos;pending&apos; status without altering stock until confirmed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 text-xs">
              {/* Account Allocation Option */}
              {registeredCustomers.length > 0 && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <label className="block font-semibold text-neutral-800">
                    Allocate to Registered Customer Account (Optional)
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white focus:outline-none focus:border-rose-600 text-xs"
                  >
                    <option value="">-- Guest Order (Unallocated) --</option>
                    {registeredCustomers.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.displayName || "Customer"} ({c.email || c.phone || c.uid.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-500">
                    Selecting a registered customer automatically allocates the order to their account so they can track it live.
                  </p>
                </div>
              )}

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  WhatsApp Conversation / Sizing Notes
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Customer requested custom blouse sleeve length; confirmed via WhatsApp chat."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              {/* Line Items */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                    Order Items ({formItems.length})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLineItem}
                    disabled={isCatalogLoading || productsCatalog.length === 0}
                    className="text-[11px] h-7 px-2.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Product Item
                  </Button>
                </div>

                {isCatalogLoading && (
                  <p className="text-neutral-400 italic">Loading product catalog...</p>
                )}

                {formItems.length === 0 && !isCatalogLoading && (
                  <div className="p-4 border border-dashed border-neutral-300 rounded-xl text-center text-neutral-400">
                    No items added. Click &quot;Add Product Item&quot; to choose requested products.
                  </div>
                )}

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {formItems.map((fi, idx) => {
                    const currentProd = productsCatalog.find((p) => p.id === fi.productId);
                    const sizes = currentProd?.sizes || [];

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center gap-2.5"
                      >
                        {/* Product Selector */}
                        <div className="flex-1 min-w-[180px]">
                          <label className="block text-[10px] text-neutral-500 mb-0.5">
                            Product
                          </label>
                          <select
                            value={fi.productId}
                            onChange={(e) => handleItemProductChange(idx, e.target.value)}
                            className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs"
                          >
                            {productsCatalog.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (SKU: {p.sku || "N/A"})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Size Selector */}
                        <div className="w-28">
                          <label className="block text-[10px] text-neutral-500 mb-0.5">
                            Size
                          </label>
                          <select
                            value={fi.sizeId}
                            onChange={(e) => handleItemSizeChange(idx, e.target.value)}
                            className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs"
                          >
                            {sizes.length > 0 ? (
                              sizes.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.stock} in stock)
                                </option>
                              ))
                            ) : (
                              <option value="">Standard</option>
                            )}
                          </select>
                        </div>

                        {/* Qty */}
                        <div className="w-16">
                          <label className="block text-[10px] text-neutral-500 mb-0.5">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={fi.quantity}
                            onChange={(e) =>
                              handleItemQuantityChange(idx, parseInt(e.target.value) || 1)
                            }
                            className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs text-center"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="w-24">
                          <label className="block text-[10px] text-neutral-500 mb-0.5">
                            Unit Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={fi.unitPrice}
                            onChange={(e) =>
                              handleItemPriceChange(idx, parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs"
                          />
                        </div>

                        {/* Line Total & Delete */}
                        <div className="flex items-center gap-2 pt-3 sm:pt-0">
                          <div className="w-20 text-right font-semibold text-neutral-900">
                            {formatPrice(fi.unitPrice * fi.quantity)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-neutral-400 hover:text-red-600 p-1"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal Preview */}
                {formItems.length > 0 && (
                  <div className="pt-2 flex justify-between items-center text-sm font-bold text-neutral-900 border-t border-neutral-100">
                    <span>Order Total:</span>
                    <span className="font-mono text-base">
                      {formatPrice(
                        formItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || formItems.length === 0}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs cursor-pointer"
                >
                  {isSubmitting ? "Creating Order..." : "Create Pending Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
