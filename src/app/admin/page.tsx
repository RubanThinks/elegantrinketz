"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Boxes,
  FolderOpen,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/services/products";
import { getAllCategoriesAdmin } from "@/services/categories";
import { getAllCollectionsAdmin } from "@/services/collections";
import { getAdminOrders } from "@/services/orders";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    productsCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categoriesCount: 0,
    collectionsCount: 0,
    ordersCount: 0,
    pendingOrdersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, cats, cols, orders] = await Promise.all([
          getAdminProducts({ pageSize: 100 }),
          getAllCategoriesAdmin(),
          getAllCollectionsAdmin(),
          getAdminOrders({ maxLimit: 100 }),
        ]);

        let low = 0;
        let out = 0;
        prodRes.products.forEach((p) => {
          const total = (p.sizes || []).reduce((sum, s) => sum + Math.max(0, s.stock || 0), 0);
          if (total === 0) out++;
          else if (total <= 3) low++;
        });

        const pending = orders.filter((o) => o.status === "pending").length;

        setStats({
          productsCount: prodRes.total,
          lowStockCount: low,
          outOfStockCount: out,
          categoriesCount: cats.length,
          collectionsCount: cols.length,
          ordersCount: orders.length,
          pendingOrdersCount: pending,
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: "WhatsApp Orders",
      count: isLoading ? "—" : `${stats.pendingOrdersCount} Pending · ${stats.ordersCount} Total`,
      href: "/admin/orders",
      icon: ClipboardList,
      badge: stats.pendingOrdersCount > 0 ? "Action Required" : "Live Enquiries",
      color: stats.pendingOrdersCount > 0 ? "text-amber-700 bg-amber-100" : "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Products in Catalog",
      count: isLoading ? "—" : stats.productsCount,
      href: "/admin/products",
      icon: Package,
      badge: "Cloudinary Connected",
      color: "text-rose-600 bg-rose-50",
    },
    {
      title: "Inventory Variants",
      count: isLoading ? "—" : `${stats.lowStockCount} Low · ${stats.outOfStockCount} Out`,
      href: "/admin/inventory",
      icon: Boxes,
      badge: "Real-time Stock",
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Categories & Collections",
      count: isLoading ? "—" : `${stats.categoriesCount} Cats · ${stats.collectionsCount} Drops`,
      href: "/admin/categories",
      icon: FolderOpen,
      badge: "Taxonomy",
      color: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-rose-600 font-bold">
            Phase 3 Media & Product Management Active
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1">
            {siteConfig.name} Administration Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Live Cloudinary media integration, variant-aware inventory, and Firestore catalog synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products/new">
            <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-xs">
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="border border-neutral-200/90 p-5 bg-white rounded-2xl flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-sm hover:border-neutral-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {stat.badge}
                </span>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {stat.count}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{stat.title}</p>
              </div>

              <div className="flex items-center text-xs font-semibold text-neutral-700 group-hover:text-rose-600 transition-colors pt-2 border-t border-neutral-100">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Production Architecture Badges */}
      <div className="border border-neutral-200 bg-neutral-50/50 rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-600" /> Phase 3 Architecture Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-600">
          <div className="flex items-start gap-2 bg-white p-3.5 rounded-xl border border-neutral-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900">Signed Cloudinary Uploads</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                API secrets secured server-side; direct browser uploads with transformation delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white p-3.5 rounded-xl border border-neutral-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900">Variant-Level Inventory</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Negative stock rejected, derived availability, partial availability support.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white p-3.5 rounded-xl border border-neutral-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900">Primary & Hover Crossfade</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Dedicated image roles unified under a single product record.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
