import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay/server";

export async function POST(request: Request) {
  try {
    let body: {
      amount?: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { amount, currency = "INR", receipt, notes } = body;

    // Validate amount: Must be present, a number, and at least 100 paise (₹1.00)
    if (typeof amount !== "number" || isNaN(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch (authErr) {
      return NextResponse.json(
        { error: (authErr as Error)?.message || "Razorpay authentication failed: missing credentials." },
        { status: 401 }
      );
    }

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount),
        currency: currency.toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}`,
        ...(notes ? { notes } : {}),
      });

      return NextResponse.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        orderId: order.id,
      });
    } catch (rzpErr: unknown) {
      const err = rzpErr as { statusCode?: number; error?: { description?: string; code?: string }; message?: string };
      console.error("[Razorpay API create order error]:", rzpErr);

      const statusCode = err?.statusCode === 401 ? 401 : 500;
      const message =
        err?.error?.description || err?.message || "Failed to create Razorpay order.";

      return NextResponse.json({ error: message }, { status: statusCode });
    }
  } catch (error: unknown) {
    console.error("[Create Order Handler Error]:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
