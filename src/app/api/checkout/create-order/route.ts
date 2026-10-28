import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay/server";
import { validateCartItemsForOrder } from "@/services/cart/validation";
import { generateOrderNumber } from "@/services/orders";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { CartItem } from "@/types";

export async function POST(request: Request) {
  try {
    // 0. Traffic Surge & Anti-Abuse Rate Limiting (20 requests / min per IP)
    const clientIp = getClientIp(request);
    const limitResult = rateLimit(`checkout-create:${clientIp}`, { limit: 20, windowMs: 60_000 });
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please wait a moment and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limitResult.reset),
            "X-RateLimit-Limit": String(limitResult.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    let body: {
      items?: CartItem[];
      customerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
      };
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const items = body.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your shopping bag is empty." },
        { status: 400 }
      );
    }

    // 1. Authoritative validation pass against live catalog & stock
    const validation = await validateCartItemsForOrder(items);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Cart validation failed due to stock or availability changes.",
          issues: validation.issues,
        },
        { status: 400 }
      );
    }

    if (validation.subtotal <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount." },
        { status: 400 }
      );
    }

    // 2. Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(validation.subtotal * 100);
    const receipt = generateOrderNumber();

    const razorpay = getRazorpayClient();
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        customerName: body.customerInfo?.name || "Customer",
        customerPhone: body.customerInfo?.phone || "",
        customerEmail: body.customerInfo?.email || "",
        totalQuantity: String(validation.totalQuantity),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      subtotal: validation.subtotal,
      receipt,
      validatedItems: validation.validatedItems,
    });
  } catch (error: unknown) {
    console.error("[Razorpay Create Order API Error]:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to initiate payment." },
      { status: 500 }
    );
  }
}
