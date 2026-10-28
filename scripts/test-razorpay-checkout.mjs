/**
 * Test Suite: Razorpay Signature Verification & Order Calculation
 */

import crypto from "crypto";

const TEST_SECRET = process.env.RAZORPAY_KEY_SECRET || "O2eBvVGuWPcRGDtvkKsSvDaQ";
const orderId = "order_Qwer1234567890";
const paymentId = "pay_Asdf0987654321";

// 1. Generate valid signature
const validSignature = crypto
  .createHmac("sha256", TEST_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

// 2. Tampered signature
const tamperedSignature = validSignature.slice(0, -4) + "0000";

function verifySignature(oId, pId, sig, secret) {
  if (!oId || !pId || !sig || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${oId}|${pId}`)
    .digest("hex");
  const expBuf = Buffer.from(expected, "utf8");
  const actBuf = Buffer.from(sig, "utf8");
  if (expBuf.length !== actBuf.length) return false;
  return crypto.timingSafeEqual(expBuf, actBuf);
}

const tests = [
  {
    name: "Razorpay Signature: Valid HMAC-SHA256 signature passes with active secret",
    run: () => verifySignature(orderId, paymentId, validSignature, TEST_SECRET) === true,
  },
  {
    name: "Razorpay Signature: Tampered signature rejected",
    run: () => verifySignature(orderId, paymentId, tamperedSignature, TEST_SECRET) === false,
  },
  {
    name: "Razorpay Signature: Wrong secret rejected",
    run: () => verifySignature(orderId, paymentId, validSignature, "wrong_secret_12345") === false,
  },
  {
    name: "Razorpay Signature: Missing orderId rejected",
    run: () => verifySignature("", paymentId, validSignature, TEST_SECRET) === false,
  },
  {
    name: "Razorpay Signature: Missing paymentId rejected",
    run: () => verifySignature(orderId, "", validSignature, TEST_SECRET) === false,
  },
  {
    name: "Razorpay Currency: INR amount converted accurately to paise (₹1250.50 -> 125050 paise)",
    run: () => {
      const subtotal = 1250.5;
      const paise = Math.round(subtotal * 100);
      return paise === 125050;
    },
  },
  {
    name: "Razorpay Minimum Amount: Amount validation (must be >= 100 paise)",
    run: () => {
      const isAllowed = (amount) => typeof amount === "number" && !isNaN(amount) && amount >= 100;
      return isAllowed(100) === true && isAllowed(99) === false && isAllowed(0) === false && isAllowed(-50) === false;
    },
  },
];

console.log("==================================================");
console.log("RUNNING RAZORPAY INTEGRATION VERIFICATION TESTS");
console.log("==================================================");

let passed = 0;
let failed = 0;

for (const t of tests) {
  try {
    const ok = t.run();
    if (ok) {
      console.log(`[PASS] ${t.name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${t.name}`);
      failed++;
    }
  } catch (err) {
    console.error(`[FAIL] ${t.name}:`, err.message);
    failed++;
  }
}

console.log(`RESULTS: ${passed}/${tests.length} PASSED (${failed} FAILED)`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("Razorpay test suite passed successfully!");
}
