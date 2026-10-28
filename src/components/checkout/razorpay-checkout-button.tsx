"use client";

import React, { useState } from "react";
import { loadRazorpayScript } from "@/lib/razorpay/load-script";
import { siteConfig } from "@/config/site";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import type {
  RazorpayOptions,
  RazorpaySuccessResponse,
  RazorpayFailedResponse,
} from "@/types/razorpay";


export interface RazorpayCheckoutButtonProps {
  /** Amount in paise (e.g. 50000 for ₹500.00). Must be >= 100 paise */
  amountPaise: number;
  currency?: string;
  receipt?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: (details: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => void;
  onError?: (errorMessage: string) => void;
}

export function RazorpayCheckoutButton({
  amountPaise,
  currency = "INR",
  receipt,
  description = "Purchase",
  customerName = "Valued Customer",
  customerEmail,
  customerPhone,
  buttonText,
  className = "",
  onSuccess,
  onError,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Load Razorpay SDK Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
      }

      // 2. Call backend order creation endpoint (POST /api/create-order)
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order on server.");
      }

      const keyId =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID;

      if (!keyId) {
        throw new Error(
          "Missing NEXT_PUBLIC_RAZORPAY_KEY_ID in environment variables."
        );
      }

      // 3. Configure Razorpay modal options
      const options: RazorpayOptions = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: siteConfig.name,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#18181b",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setErrorMessage("Payment was cancelled by the user.");
            if (onError) onError("Payment was cancelled by the user.");
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            setLoading(true);
            // 4. Send payment credentials to backend verification endpoint (POST /api/verify-payment)
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.error || "Cryptographic signature verification failed."
              );
            }

            setSuccessMessage(
              `Payment successful! Payment ID: ${response.razorpay_payment_id}`
            );
            if (onSuccess) {
              onSuccess({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
            }
          } catch (verifyError: unknown) {
            const msg =
              (verifyError as Error)?.message ||
              "Failed to verify payment with server.";
            setErrorMessage(msg);
            if (onError) onError(msg);
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment failure event (card decline, UPI timeout, etc.)
      razorpayInstance.on("payment.failed", (response: unknown) => {
        const failedRes = response as RazorpayFailedResponse;
        const failureReason =
          failedRes?.error?.description ||
          failedRes?.error?.reason ||
          "Payment processing failed.";
        setErrorMessage(failureReason);
        setLoading(false);
        if (onError) onError(failureReason);
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Checkout initialization failed.";
      setErrorMessage(msg);
      setLoading(false);
      if (onError) onError(msg);
    }
  };

  const formattedAmount = (amountPaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: currency || "INR",
  });

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>{buttonText || `Pay with Razorpay (${formattedAmount})`}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
