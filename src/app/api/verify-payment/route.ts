import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // Support both snake_case and camelCase field names
    const orderId = (body.razorpay_order_id ||
      body.order_id ||
      body.razorpayOrderId ||
      body.orderId) as string | undefined;

    const paymentId = (body.razorpay_payment_id ||
      body.payment_id ||
      body.razorpayPaymentId ||
      body.paymentId) as string | undefined;

    const signature = (body.razorpay_signature ||
      body.signature ||
      body.razorpaySignature) as string | undefined;

    // Missing fields: return 400
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          error:
            "Missing required payment verification fields. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
        },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("[Razorpay Verify]: RAZORPAY_KEY_SECRET is not configured.");
      return NextResponse.json(
        { error: "Payment verification configuration error on server." },
        { status: 500 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    const isMatch =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    // Signature mismatch: return 400, do NOT mark as paid
    if (!isMatch) {
      console.warn(
        `[Razorpay Signature Mismatch] order: ${orderId}, payment: ${paymentId}`
      );
      return NextResponse.json(
        {
          success: false,
          error: "Signature mismatch. Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // Return success only if signatures match
    return NextResponse.json({
      success: true,
      message: "Payment signature verified successfully.",
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (error: unknown) {
    console.error("[Razorpay Verify API Error]:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
