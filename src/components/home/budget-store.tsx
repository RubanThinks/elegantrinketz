import React from "react";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

const BUDGET_BRACKETS = [
  {
    label: "Under ₹499",
    description: "Daily Kurtis, Pants & Shimmer Leggings",
    href: "/shop?maxPrice=499",
    badge: "Super Value",
    accent: "bg-emerald-600",
  },
  {
    label: "Under ₹799",
    description: "Umbrella & Designer Side Cut Kurtis",
    href: "/shop?maxPrice=799",
    badge: "Most Popular",
    accent: "bg-blue-600",
  },
  {
    label: "Under ₹999",
    description: "2-Piece Sets & Festive Tunics",
    href: "/shop?maxPrice=999",
    badge: "Festive Deals",
    accent: "bg-amber-600",
  },
  {
    label: "Under ₹1,499",
    description: "Full 3-Piece Sets with Dupatta",
    href: "/shop?maxPrice=1499",
    badge: "Premium Sets",
    accent: "bg-purple-600",
  },
];

export function BudgetStore() {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 mb-6 gap-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-neutral-900" />
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight font-flipkart">
              Budget Store · Shop by Price
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Find premium styles fitting every wallet
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {BUDGET_BRACKETS.map((bracket) => (
            <Link
              key={bracket.label}
              href={bracket.href}
              className="group p-4 sm:p-5 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider ${bracket.accent}`}>
                    {bracket.badge}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 font-flipkart tracking-tight mt-1">
                  {bracket.label}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {bracket.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center text-xs font-bold text-neutral-900 group-hover:text-red-600 transition-colors uppercase tracking-wider font-flipkart">
                <span>Shop Now</span>
                <span className="ml-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
