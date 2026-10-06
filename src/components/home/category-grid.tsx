import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CATEGORY_TILES = [
  {
    title: "Side Cut Kurtis",
    tagline: "Trending Daily & Festive",
    priceText: "From ₹499",
    href: "/shop/side-cut-kurtis",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    badge: "Bestseller",
  },
  {
    title: "3-Piece Sets",
    tagline: "Kurti, Pant & Dupatta",
    priceText: "From ₹899",
    href: "/shop/three-piece-sets",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    badge: "Festive Ready",
  },
  {
    title: "Umbrella Kurtis",
    tagline: "Flared Elegance",
    priceText: "From ₹599",
    href: "/shop/umbrella-kurtis",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
    badge: "Popular",
  },
  {
    title: "Straight Pants",
    tagline: "Comfort Stretch Trousers",
    priceText: "From ₹399",
    href: "/shop/straight-pants",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
    badge: "Essential",
  },
  {
    title: "Shimmer Leggings",
    tagline: "Premium Lycra Glitter",
    priceText: "From ₹299",
    href: "/shop/shimmer-leggings",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    badge: "Under ₹499",
  },
  {
    title: "Ethnic Festive Drops",
    tagline: "Handpicked Party Outfits",
    priceText: "Up to 40% Off",
    href: "/shop/ethnic-wear",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    badge: "Limited Stock",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-10 sm:py-14 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 font-flipkart">
              Curated Departments
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-flipkart mt-0.5">
              Shop by Outfit Style
            </h2>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-red-600 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="ml-1 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 6-Card Visual Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative bg-white border border-neutral-200 hover:border-neutral-900 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={tile.imageUrl}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-950 text-white uppercase tracking-wider">
                  {tile.badge}
                </span>
              </div>

              {/* Text Meta */}
              <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-white">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate font-flipkart group-hover:text-red-600 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {tile.tagline}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#388e3c] font-flipkart">
                    {tile.priceText}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
