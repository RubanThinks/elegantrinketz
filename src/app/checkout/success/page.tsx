"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "ORD-CONFIRMED";
  const amount = searchParams.get("amount");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-100/80 border border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-pulse" />
      </div>

      <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full inline-block mb-3">
        Payment Verified & Confirmed
      </span>

      <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight mb-3">
        Thank You for Your Order!
      </h1>

      <p className="text-neutral-600 text-sm sm:text-base max-w-md mx-auto mb-8 font-light leading-relaxed">
        Your payment has been successfully processed via Razorpay. We are now handcrafting and preparing your collection pieces for dispatch.
      </p>

      {/* Order Info Card */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
          <div>
            <span className="text-xs text-neutral-400 block font-light">Order Number</span>
            <span className="text-lg font-mono font-bold text-neutral-900 tracking-tight">
              {orderNumber}
            </span>
          </div>
          {amount && (
            <div className="sm:text-right">
              <span className="text-xs text-neutral-400 block font-light">Amount Paid</span>
              <span className="text-lg font-semibold text-neutral-900">
                ₹{Number(amount).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
          <ShieldCheck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            A confirmation notification has been registered with your order details. You can track courier dispatch milestones directly from your account.
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/account/orders" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl text-xs uppercase tracking-wider font-semibold py-3.5 px-6"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <Link href="/shop" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl text-xs uppercase tracking-wider font-semibold py-3.5 px-6"
          >
            <Home className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Suspense
        fallback={
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-600">Loading order confirmation...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
