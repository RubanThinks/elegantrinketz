"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X,
  Lock,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Truck,
  Zap,
  MapPin,
  Check,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import { updateUserProfile } from "@/services/users";
import { loadRazorpayScript } from "@/lib/razorpay/load-script";
import { formatPrice } from "@/config/constants";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES, getDistrictsForState } from "@/config/india-locations";
import type { Address, CartItem } from "@/types";
import type { RazorpayOptions, RazorpaySuccessResponse } from "@/types/razorpay";

export interface OnlineCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, checks out ONLY this single product (Buy Now flow), keeping the cart intact */
  directItem?: CartItem | null;
}

function CheckoutModalContent({
  onClose,
  directItem,
}: {
  onClose: () => void;
  directItem?: CartItem | null;
}) {
  const router = useRouter();
  const { user, userProfile, refreshProfile } = useAuth();
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();

  // If a single product "Buy Now" was clicked, isolate checkout to that product only!
  const isDirectBuy = Boolean(directItem);
  const items = directItem ? [directItem] : cartItems;
  const subtotal = directItem
    ? (directItem.unitPrice ?? 0) * directItem.quantity
    : cartSubtotal;

  const defaultAddr =
    userProfile?.addresses?.find((a) => a.isDefault) ||
    userProfile?.addresses?.[0];

  // Initialize directly from user profile & default address
  const [fullName, setFullName] = useState(defaultAddr?.fullName || userProfile?.displayName || "");
  const [phone, setPhone] = useState(defaultAddr?.phone || userProfile?.phone || "");
  const [email, setEmail] = useState(userProfile?.email || user?.email || "");
  const [addressLine1, setAddressLine1] = useState(defaultAddr?.line1 || "");
  const [addressLine2, setAddressLine2] = useState(defaultAddr?.line2 || "");
  const [state, setState] = useState(defaultAddr?.state || "Tamil Nadu");
  const [city, setCity] = useState(defaultAddr?.city || "Salem");
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || "");
  const [notes, setNotes] = useState("");
  const [saveAddressToProfile, setSaveAddressToProfile] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddr?.id || null);

  const availableDistricts = React.useMemo(() => getDistrictsForState(state), [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = getDistrictsForState(newState);
    if (districts.length > 0) {
      if (districts.includes(city)) {
        setIsCustomCity(false);
      } else {
        setCity(districts[0]);
        setIsCustomCity(false);
      }
    } else {
      setIsCustomCity(true);
    }
    setSelectedAddressId(null);
  };

  const handleDistrictChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustomCity(true);
      setCity("");
    } else {
      setIsCustomCity(false);
      setCity(val);
    }
    setSelectedAddressId(null);
  };

  const selectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    if (addr.fullName) setFullName(addr.fullName);
    if (addr.phone) setPhone(addr.phone);
    if (addr.line1) setAddressLine1(addr.line1);
    setAddressLine2(addr.line2 || "");
    if (addr.state) {
      setState(addr.state);
      const districts = getDistrictsForState(addr.state);
      if (addr.city) {
        setCity(addr.city);
        setIsCustomCity(districts.length > 0 && !districts.includes(addr.city));
      }
    } else if (addr.city) {
      setCity(addr.city);
    }
    if (addr.postalCode) setPostalCode(addr.postalCode);
  };

  const persistAddressIfRequested = async () => {
    if (!user?.uid || !saveAddressToProfile) return;
    try {
      const existingList: Address[] = userProfile?.addresses || [];
      const newAddr: Address = {
        id: selectedAddressId || `addr-${Date.now()}`,
        label: "Saved Address",
        fullName: fullName.trim(),
        phone: phone.trim(),
        line1: addressLine1.trim(),
        line2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: "India",
        isDefault: true,
      };

      const updated: Address[] = existingList.map((a) => ({ ...a, isDefault: false }));
      const existingIdx = updated.findIndex(
        (a) =>
          a.id === selectedAddressId ||
          (a.line1.toLowerCase() === newAddr.line1.toLowerCase() && a.postalCode === newAddr.postalCode)
      );

      if (existingIdx !== -1) {
        updated[existingIdx] = newAddr;
      } else {
        updated.unshift(newAddr);
      }

      await updateUserProfile(user.uid, { addresses: updated });
      await refreshProfile();
    } catch (err) {
      console.error("Failed to auto-save address:", err);
    }
  };

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setErrorMessage("Please complete all required shipping address fields.");
      return;
    }

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      line1: addressLine1.trim(),
      line2: addressLine2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: "India",
    };

    setIsProcessing(true);
    setStatusMessage("Validating live inventory and initializing payment...");

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      // 2. Call backend to create Razorpay Order
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerInfo: {
            name: fullName.trim(),
            email: email.trim() || undefined,
            phone: phone.trim(),
          },
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize order.");
      }

      setStatusMessage("Opening secure Razorpay portal...");

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key is not configured.");
      }

      // 3. Configure Razorpay options
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: siteConfig.name,
        description: isDirectBuy
          ? `Order ${orderData.receipt} (${directItem?.productName || "Item"})`
          : `Order ${orderData.receipt} (${items.length} items)`,
        order_id: orderData.orderId,
        prefill: {
          name: fullName.trim(),
          email: email.trim() || undefined,
          contact: phone.trim(),
        },
        theme: {
          color: "#18181b", // Sleek neutral-900 luxury tone
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStatusMessage(null);
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          setStatusMessage("Payment received! Verifying signature and reserving your items...");

          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                customerName: fullName.trim(),
                customerPhone: phone.trim(),
                customerEmail: email.trim() || null,
                userId: user?.uid || null,
                shippingAddress,
                items: orderData.validatedItems.map((vi: {
                  productId: string;
                  productName: string;
                  sku: string;
                  sizeName?: string | null;
                  quantity: number;
                  unitPrice: number;
                  lineTotal: number;
                  image?: string;
                }) => ({
                  productId: vi.productId,
                  name: vi.productName,
                  sku: vi.sku,
                  sizeName: vi.sizeName || null,
                  quantity: vi.quantity,
                  unitPrice: vi.unitPrice,
                  lineTotal: vi.lineTotal,
                  image: vi.image,
                })),
                totalAmount: orderData.subtotal,
                notes: notes.trim() || undefined,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            // Persist delivery address if customer chose to save it
            await persistAddressIfRequested();

            // Clear shopping bag ONLY if this was a full cart checkout (preserve cart on Buy Now)
            if (!isDirectBuy) {
              await clearCart();
            }
            onClose();

            // Redirect to success page
            router.push(
              `/checkout/success?orderNumber=${encodeURIComponent(
                verifyData.orderNumber
              )}&amount=${encodeURIComponent(orderData.subtotal)}`
            );
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setErrorMessage(
              (verifyErr as Error)?.message ||
                "Payment succeeded with Razorpay, but verification encountered an error. Please reach out to customer support with your payment ID: " +
                response.razorpay_payment_id
            );
            setIsProcessing(false);
            setStatusMessage(null);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", (response: unknown) => {
        const failedRes = response as { error?: { description?: string; reason?: string } };
        const failureReason =
          failedRes?.error?.description ||
          failedRes?.error?.reason ||
          "Payment processing failed. Please try again or use another payment method.";
        setErrorMessage(failureReason);
        setIsProcessing(false);
        setStatusMessage(null);
      });
      rzpInstance.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      setErrorMessage((err as Error)?.message || "Failed to start payment.");
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-neutral-200 rounded-3xl shadow-2xl max-w-xl w-full max-h-[min(90vh,780px)] flex flex-col overflow-hidden text-neutral-900 animate-in fade-in zoom-in-95 duration-200 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-neutral-100 bg-neutral-50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center">
            {isDirectBuy ? (
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 id="checkout-modal-title" className="text-base font-serif font-semibold text-neutral-900">
              {isDirectBuy ? "Instant Buy Now" : "Secure Online Checkout"}
            </h2>
            <p className="text-[11px] text-neutral-500 font-light">
              {isDirectBuy
                ? "Direct 1-Item Purchase • Your shopping bag remains saved"
                : "Razorpay 256-bit Encrypted • UPI, Cards, Netbanking"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors disabled:opacity-30 cursor-pointer"
          aria-label="Close checkout modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Form Body */}
      <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
        {/* Status / Error Notifications */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
            <div className="w-3.5 h-3.5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Order Mini-Summary */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
          {/* Direct Buy Product Preview Card */}
          {isDirectBuy && directItem && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-neutral-200 mb-2">
              {directItem.image && (
                <div className="w-12 h-14 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0">
                  <Image
                    src={directItem.image}
                    alt={directItem.productName || "Product"}
                    fill
                    className="object-cover object-top"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 mb-0.5">
                  Single Item Purchase
                </span>
                <h4 className="text-xs font-bold text-neutral-900 truncate">
                  {directItem.productName}
                </h4>
                <p className="text-[11px] text-neutral-500">
                  {directItem.sizeName ? `Size: ${directItem.sizeName} · ` : ""}Qty: {directItem.quantity}
                </p>
                <p className="text-xs font-semibold text-rose-600 font-mono">
                  {formatPrice((directItem.unitPrice ?? 0) * directItem.quantity)}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-neutral-600">
            <span>{isDirectBuy ? "Item Subtotal" : `Items in Order (${items.length})`}</span>
            <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-neutral-600">
            <span>Delivery Fee</span>
            <span className="text-emerald-600 font-medium">Free Express Delivery</span>
          </div>
          <div className="pt-2 border-t border-neutral-200/70 flex justify-between items-baseline text-sm font-semibold text-neutral-950">
            <span>Total Payable</span>
            <span className="text-base font-bold text-neutral-950">{formatPrice(subtotal)}</span>
          </div>
        </div>

        <form id="online-checkout-form" onSubmit={handlePayNow} className="space-y-4">
          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address <span className="text-neutral-400 font-light">(for receipt & updates)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>2. Delivery Address</span>
              </h3>

              {userProfile?.addresses && userProfile.addresses.length > 0 && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Auto-filled from profile
                </span>
              )}
            </div>

            {/* Quick Selection for Saved Addresses */}
            {userProfile?.addresses && userProfile.addresses.length > 0 && (
              <div className="mb-3 space-y-1.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-700 block">
                  Choose from Saved Addresses:
                </span>
                <div className="flex flex-wrap gap-2">
                  {userProfile.addresses.map((a) => {
                    const isSelected = selectedAddressId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => selectSavedAddress(a)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-2xs"
                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-rose-600" />
                        <span>{a.label || a.city}</span>
                        {a.isDefault && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-semibold">
                            Default
                          </span>
                        )}
                        {isSelected && <Check className="w-3 h-3 text-rose-600 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Flat / House No. / Building / Street <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => {
                    setAddressLine1(e.target.value);
                    setSelectedAddressId(null);
                  }}
                  placeholder="e.g. 402, Lotus Residency, 5th Cross Road"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Locality / Landmark <span className="text-neutral-400 font-light">(optional)</span>
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* State Dropdown (All Indian States & UTs) */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white text-neutral-900 font-medium cursor-pointer"
                  >
                    <option value="" disabled>
                      Select State
                    </option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District / City Dropdown (Populated by selected State) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-neutral-700">
                      District / City <span className="text-rose-500">*</span>
                    </label>
                    {isCustomCity && availableDistricts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCity(false);
                          if (availableDistricts.length > 0) setCity(availableDistricts[0]);
                        }}
                        className="text-[10px] text-rose-600 hover:text-rose-700 underline font-medium cursor-pointer"
                      >
                        List view
                      </button>
                    )}
                  </div>

                  {isCustomCity || availableDistricts.length === 0 ? (
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      placeholder="e.g. Salem, Attur..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                    />
                  ) : (
                    <select
                      required
                      value={availableDistricts.includes(city) ? city : (city ? "__custom__" : "")}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none bg-white text-neutral-900 font-medium cursor-pointer"
                    >
                      <option value="" disabled>
                        Select District
                      </option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="__custom__">✏️ Other / Enter Manually...</option>
                    </select>
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="e.g. 636302"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Save Address Prompt for Authenticated Users */}
              {user && (
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 cursor-pointer hover:bg-neutral-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={saveAddressToProfile}
                    onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-800">
                      Save this delivery address to my account
                    </p>
                    <p className="text-[11px] text-neutral-500 font-light">
                      Automatically auto-fills next time you check out or log in.
                    </p>
                  </div>
                </label>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Special Delivery Instructions <span className="text-neutral-400 font-light">(optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave with security if not available"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official Razorpay Payment Gateway</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-200/60 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>

          <Button
            form="online-checkout-form"
            type="submit"
            variant="primary"
            size="lg"
            disabled={isProcessing}
            className="w-full sm:w-auto text-xs uppercase tracking-wider font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white shadow-md cursor-pointer disabled:opacity-40"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay {formatPrice(subtotal)}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OnlineCheckoutModal({
  isOpen,
  onClose,
  directItem,
}: OnlineCheckoutModalProps) {
  const { userProfile, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and allow dismissing with Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 isolate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      onClick={onClose}
    >
      <div className="w-full max-w-xl my-auto flex justify-center">
        <CheckoutModalContent
          key={
            directItem
              ? `direct-${directItem.productId}-${directItem.sizeId || "std"}`
              : userProfile?.uid || user?.uid || "cart-checkout"
          }
          onClose={onClose}
          directItem={directItem}
        />
      </div>
    </div>,
    document.body
  );
}
