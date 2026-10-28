import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Returns a configured Razorpay server client instance.
 * Throws early if environment variables are missing.
 */
export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Set RAZORPAY_KEY_ID (or NEXT_PUBLIC_RAZORPAY_KEY_ID) and RAZORPAY_KEY_SECRET in environment variables."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Cryptographically verifies that the payment response originates from Razorpay.
 * Computes HMAC-SHA256 of `${orderId}|${paymentId}` with the server secret
 * and does constant-time safe comparison against the signature received from the client.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured on the server.");
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
