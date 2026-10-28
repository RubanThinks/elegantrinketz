"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { getAllProductReviews, deleteProductReview } from "@/services/reviews";
import type { ProductReview } from "@/types";
import { Button } from "@/components/ui/button";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getAllProductReviews();
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (reviewId: string, productId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer review? Use this for spam, profanity, or illegible content.")) {
      return;
    }

    setDeletingId(reviewId);
    setActionMessage(null);

    try {
      const res = await deleteProductReview(reviewId, productId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setActionMessage({
          type: "success",
          text: "Review was deleted successfully and removed from the storefront.",
        });
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionMessage({ type: "error", text: res.message });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: (err as Error)?.message || "Failed to delete review.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (ratingFilter !== "all" && rev.rating !== ratingFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = rev.authorName?.toLowerCase().includes(q);
      const matchCity = rev.authorCity?.toLowerCase().includes(q);
      const matchTitle = rev.title?.toLowerCase().includes(q);
      const matchComment = rev.comment?.toLowerCase().includes(q);
      const matchProduct = rev.productSlug?.toLowerCase().includes(q) || rev.productId?.toLowerCase().includes(q);
      return matchAuthor || matchCity || matchTitle || matchComment || matchProduct;
    }
    return true;
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const lowRatingCount = reviews.filter((r) => r.rating <= 2).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-rose-600 font-bold">
            Customer Feedback & Moderation
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-rose-600" /> Customer Reviews
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Monitor real buyer feedback, celebrate verified customer ratings, and delete spam or illegible reviews.
          </p>
        </div>
      </div>

      {/* Notification Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-neutral-200/90 p-4.5 bg-white rounded-2xl shadow-2xs">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Total Reviews
          </span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {totalReviews}
          </div>
          <span className="text-[11px] text-neutral-500">Across all catalog products</span>
        </div>

        <div className="border border-neutral-200/90 p-4.5 bg-white rounded-2xl shadow-2xs">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Average Rating
          </span>
          <div className="text-2xl font-bold text-neutral-900 mt-1 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] text-neutral-500">Storewide buyer satisfaction</span>
        </div>

        <div className="border border-neutral-200/90 p-4.5 bg-white rounded-2xl shadow-2xs">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
            5-Star Reviews
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {fiveStarCount}
          </div>
          <span className="text-[11px] text-neutral-500">Top customer impressions</span>
        </div>

        <div className="border border-neutral-200/90 p-4.5 bg-white rounded-2xl shadow-2xs">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Low Ratings (≤2★)
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {lowRatingCount}
          </div>
          <span className="text-[11px] text-neutral-500">Candidate reviews to inspect</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, city, review title, comment, or product..."
            className="w-full pl-9.5 pr-4 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
          />
        </div>

        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {(["all", 5, 4, 3, 2, 1] as const).map((r) => (
            <button
              key={String(r)}
              type="button"
              onClick={() => setRatingFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                ratingFilter === r
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {r === "all" ? "All Stars" : `${r} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-600" />
            <p>Loading real customer reviews from database...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <Sparkles className="w-6 h-6 mx-auto text-neutral-300" />
            <p className="font-semibold text-neutral-700">No customer reviews match your criteria</p>
            <p className="text-neutral-400">
              {reviews.length === 0
                ? "As customers leave reviews on product pages, they will appear here automatically for moderation."
                : "Try clearing your search query or rating filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-5 hover:bg-neutral-50/60 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {rev.authorName?.[0] || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">
                          {rev.authorName}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          ({rev.authorCity || "India"})
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Product Link */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {rev.productSlug && (
                      <Link
                        href={`/products/${rev.productSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-rose-600 transition-colors px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
                      >
                        <span>View Product</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {/* Admin Delete Action Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id, rev.productId)}
                      disabled={deletingId === rev.id}
                      title="Delete spam or illegible review"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === rev.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Delete Review</span>
                    </button>
                  </div>
                </div>

                {/* Rating & Headline */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-200"
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    {rev.title}
                  </h4>
                </div>

                {/* Comment Body */}
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  {rev.comment}
                </p>

                {/* Product Tag */}
                <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2">
                  <span>Product ID: {rev.productId}</span>
                  {rev.productSlug && <span>• Slug: {rev.productSlug}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
