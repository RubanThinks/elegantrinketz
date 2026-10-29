import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay/server";
import { createPaidOnlineOrder } from "@/services/orders";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { Address, OrderType, ResellerDetails } from "@/types";

interface VerifyPaymentRequestBody {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  userId?: string | null;
  shippingAddress: Address;
  items: Array<{
    productId: string;
    sizeId?: string | null;
    sizeName?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    name?: string;
    sku?: string;
    image?: string;
  }>;
  totalAmount: number;
  notes?: string;
  orderType?: OrderType;
  isResellerOrder?: boolean;
  resellerDetails?: ResellerDetails;
}

export async function POST(request: Request) {
  try {
    // 0. Traffic Surge & Anti-Abuse Rate Limiting (30 requests / min per IP)
    const clientIp = getClientIp(request);
    const limitResult = rateLimit(`checkout-verify:${clientIp}`, { limit: 30, windowMs: 60_000 });
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait a moment." },
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

    let body: VerifyPaymentRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customerName,
      customerPhone,
      customerEmail,
      userId,
      shippingAddress,
      items,
      totalAmount,
      notes,
      orderType,
      isResellerOrder,
      resellerDetails,
    } = body;

    // 1. Basic validation
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Payment verification details are missing." },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json(
        { error: "Customer details and shipping address are required." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cannot complete order with empty item list." },
        { status: 400 }
      );
    }

    // 2. Cryptographic signature verification
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      console.error(
        `[Razorpay Signature Verification Failed] orderId: ${razorpayOrderId}, paymentId: ${razorpayPaymentId}`
      );
      return NextResponse.json(
        { error: "Cryptographic payment signature verification failed. Potential tampering detected." },
        { status: 400 }
      );
    }

    // 3. Atomically deduct stock & write confirmed order to Firestore
    const orderResult = await createPaidOnlineOrder({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      userId: userId || null,
      shippingAddress,
      items,
      totalAmount,
      notes,
      orderType,
      isResellerOrder,
      resellerDetails,
    });

    if (!orderResult.success) {
      return NextResponse.json(
        {
          error:
            orderResult.message ||
            "Payment verified, but failed to record order or stock was insufficient.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: orderResult.id,
      orderNumber: orderResult.orderNumber,
      message: "Payment successfully verified and order created.",
    });
  } catch (error: unknown) {
    console.error("[Razorpay Verify Payment API Error]:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to process payment verification." },
      { status: 500 }
    );
  }
}
