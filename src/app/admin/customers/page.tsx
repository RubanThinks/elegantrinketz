"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  MessageCircle,
  MapPin,
  Tag,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { getRegisteredCustomers } from "@/services/users";
import { getAdminOrders } from "@/services/orders";
import type { UserProfile, Order } from "@/types";

interface UnifiedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  isRegistered: boolean;
  orderCount: number;
  totalSpent: number;
  lastActive: string;
  city?: string;
  state?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UnifiedCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "registered" | "buyers">("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersList, ordersList] = await Promise.all([
        getRegisteredCustomers(100).catch(() => [] as UserProfile[]),
        getAdminOrders({ maxLimit: 100 }).catch(() => [] as Order[]),
      ]);

      const customerMap = new Map<string, UnifiedCustomer>();

      // 1. Process registered accounts
      usersList.forEach((u) => {
        const key = u.email ? u.email.toLowerCase() : u.uid;
        const defaultAddr = u.addresses?.find((a) => a.isDefault) || u.addresses?.[0];
        customerMap.set(key, {
          id: u.uid,
          name: u.displayName || "Registered Shopper",
          email: u.email || "",
          phone: u.phone || defaultAddr?.phone || "",
          role: u.role || "customer",
          isRegistered: true,
          orderCount: 0,
          totalSpent: 0,
          lastActive: u.createdAt || new Date().toISOString(),
          city: defaultAddr?.city,
          state: defaultAddr?.state,
        });
      });

      // 2. Correlate with orders
      ordersList.forEach((o) => {
        const key = o.customerEmail ? o.customerEmail.toLowerCase() : (o.userId || o.customerPhone || o.customerName);
        const existing = customerMap.get(key);

        if (existing) {
          existing.orderCount += 1;
          existing.totalSpent += o.totalAmount || 0;
          if (o.customerPhone && !existing.phone) existing.phone = o.customerPhone;
          if (o.shippingAddress?.city && !existing.city) existing.city = o.shippingAddress.city;
          if (o.shippingAddress?.state && !existing.state) existing.state = o.shippingAddress.state;
        } else {
          // Customer ordered as guest / WhatsApp shopper
          customerMap.set(key, {
            id: o.userId || `shopper_${o.id}`,
            name: o.customerName || "Store Shopper",
            email: o.customerEmail || "",
            phone: o.customerPhone || "",
            role: "shopper",
            isRegistered: Boolean(o.userId),
            orderCount: 1,
            totalSpent: o.totalAmount || 0,
            lastActive: (o as { createdAt?: string }).createdAt || new Date().toISOString(),
            city: o.shippingAddress?.city,
            state: o.shippingAddress?.state,
          });
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error("Failed to load customers directory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = customers.filter((c) => {
    if (filterType === "registered" && !c.isRegistered) return false;
    if (filterType === "buyers" && c.orderCount === 0) return false;

    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.city && c.city.toLowerCase().includes(term))
    );
  });

  const registeredCount = customers.filter((c) => c.isRegistered).length;
  const buyerCount = customers.filter((c) => c.orderCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-600" />
              <span>Customer Directory</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-900 text-white shadow-xs">
              {customers.length} Total Shoppers
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Registered accounts, WhatsApp purchasers, verified contact records, and order history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
            Total Unique Customers
          </span>
          <div className="text-xl font-bold text-neutral-900">{customers.length}</div>
          <p className="text-[11px] text-neutral-500">Across all store channels</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
            Registered Shoppers
          </span>
          <div className="text-xl font-bold text-neutral-900">{registeredCount}</div>
          <p className="text-[11px] text-neutral-500">Self-registered customer accounts</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
            Active Buyers
          </span>
          <div className="text-xl font-bold text-neutral-900">{buyerCount}</div>
          <p className="text-[11px] text-neutral-500">Shoppers with at least 1 order</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Solid Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-xs"
            }`}
          >
            All ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("registered")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "registered"
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-xs"
            }`}
          >
            Registered Accounts ({registeredCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("buyers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "buyers"
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-xs"
            }`}
          >
            Order Buyers ({buyerCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, city..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
          />
        </div>
      </div>

      {/* Customer Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3 bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <RefreshCw className="w-6 h-6 text-neutral-500 animate-spin" />
          <p className="text-xs font-semibold text-neutral-600">Loading customer records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-neutral-900">
              {search ? "No matching customers found" : "Customer Directory Ready"}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {search
                ? `No customers match "${search}". Try searching by another keyword.`
                : "Customers will automatically appear here when shoppers register an account or place orders."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Check Orders
            </Link>
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Open Storefront
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Shopper</th>
                  <th className="py-3 px-4">Direct Contact</th>
                  <th className="py-3 px-4">Orders &amp; Spend</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((c) => (
                  <tr key={c.id + c.email} className="hover:bg-neutral-50 transition-colors">
                    {/* Shopper Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.role === "admin" || c.role === "super_admin" ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white uppercase">
                            Admin
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        ID: {c.id.slice(0, 12)}...
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 space-y-1">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900 hover:underline"
                        >
                          <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[190px]">{c.email}</span>
                        </a>
                      ) : (
                        <span className="text-neutral-400 italic">No email</span>
                      )}

                      {c.phone ? (
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{c.phone}</span>
                        </a>
                      ) : (
                        <span className="text-neutral-400 italic block">No phone</span>
                      )}
                    </td>

                    {/* Orders & Spend */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.orderCount > 0
                              ? "bg-rose-100 text-rose-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                        </span>
                      </div>
                      {c.totalSpent > 0 && (
                        <div className="text-[11px] font-bold text-neutral-900 mt-1">
                          ₹{c.totalSpent.toLocaleString("en-IN")} lifetime
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-neutral-600">
                      {c.city || c.state ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>
                            {[c.city, c.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {c.isRegistered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-900 text-white shadow-xs">
                          <UserCheck className="w-3 h-3" />
                          <span>Registered</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 shadow-xs">
                          <ShoppingBag className="w-3 h-3" />
                          <span>Store Shopper</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Orders</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
