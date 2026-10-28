import React from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopping Bag",
  description: "Review items in your shopping bag and proceed to secure online checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <CartView />
    </div>
  );
}
