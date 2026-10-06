"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquarePlus, CheckCircle2, ThumbsUp, Sparkles, X } from "lucide-react";
import type { ProductReview } from "@/types";
import { getProductReviews, submitProductReview } from "@/services/reviews";
import { Button } from "@/components/ui/button";

interface ProductReviewsProps {
  productId: string;
  productName: string;
  productSlug?: string;
}

export function ProductReviews({
  productId,
  productName,
  productSlug,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [authorCity, setAuthorCity] = useState("Salem");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadReviews() {
      setIsLoading(true);
      try {
        const data = await getProductReviews(productId);
        if (!ignore) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to load product reviews:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadReviews();
    return () => {
      ignore = true;
    };
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!authorName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!title.trim()) {
      setFormError("Please enter a short headline for your review.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Please share your feedback or experience with this design.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newRev = await submitProductReview({
        productId,
        productSlug,
        authorName: authorName.trim(),
        authorCity: authorCity.trim() || "Salem",
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      setReviews((prev) => [newRev, ...prev]);
      setSubmitSuccess(true);
      setIsFormOpen(false);

      // Reset form
      setRating(5);
      setAuthorName("");
      setTitle("");
      setComment("");

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch {
      setFormError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
        ).toFixed(1)
      : null;

  return (
    <section className="mt-16 pt-10 border-t border-neutral-200" id="customer-reviews">
      <div className="space-y-8">
        {/* Header & Write Review Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 tracking-tight">
                Customer Reviews
              </h2>
              {averageRating && (
                <span className="px-2.5 py-0.5 rounded-md bg-[#388e3c] text-white text-xs font-bold font-flipkart flex items-center gap-1">
                  <span>{averageRating}</span>
                  <span className="text-[10px]">★</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-flipkart">
              {reviewCount === 0
                ? "No reviews yet. Be the first to share your experience with this design!"
                : `Based on ${reviewCount} genuine customer review${reviewCount > 1 ? "s" : ""}.`}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="self-start sm:self-auto text-xs font-semibold border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Customer Review</span>
          </Button>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your review has been published successfully.</span>
          </div>
        )}

        {/* Review Form Drawer / Box */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 rounded-2xl bg-rose-50/40 border border-rose-200/80 shadow-xs space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <h3 className="text-sm font-bold text-neutral-900">
                Review for {productName}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
                aria-label="Close review form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-medium">
                {formError}
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                Your Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled =
                    (hoverRating !== null ? hoverRating : rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(starVal)}
                      className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-125"
                      aria-label={`${starVal} star`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-300"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs text-neutral-500 ml-2 font-medium">
                  {rating === 5 && "Excellent"}
                  {rating === 4 && "Very Good"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </span>
              </div>
            </div>

            {/* Name & City Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Meenakshi S."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={authorCity}
                  onChange={(e) => setAuthorCity(e.target.value)}
                  placeholder="e.g. Salem, Chennai, Bangalore"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            {/* Headline Title */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Review Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Beautiful fabric, perfect fitting & fast dispatch!"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Review Feedback <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell other shoppers how the fit, material, and colors felt..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-2">
            <Sparkles className="w-6 h-6 text-neutral-300 mx-auto" />
            <h4 className="text-sm font-semibold text-neutral-700">
              No customer reviews yet
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light leading-relaxed">
              Be the first customer to write a review for {productName}. Your feedback helps our boutique and other shoppers!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {reviews.map((rev) => (
              <article key={rev.id} className="py-4.5 space-y-2 font-flipkart">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold uppercase">
                      {rev.authorName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 leading-none">
                        {rev.authorName}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {rev.authorCity} · Verified Customer
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-400">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Rating Stars & Title */}
                <div className="flex items-center gap-2 pt-0.5">
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

                {/* Review Text */}
                <p className="text-xs text-neutral-600 font-light leading-relaxed">
                  {rev.comment}
                </p>

                {/* Verified Purchase Tag */}
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium pt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Purchase from Elegant Trinketz</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
