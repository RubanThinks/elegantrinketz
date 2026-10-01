import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Collections",
  description:
    "Explore our signature fashion collections — New Arrivals, Best Sellers, Wedding Season, and Festive Edit.",
  path: "/collections",
});

const collections = [
  {
    title: "New Arrivals",
    slug: "new-arrivals",
    tagline: "Autumn / Winter 2026",
    description: "The latest contemporary arrivals handpicked for the season.",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Best Sellers",
    slug: "best-sellers",
    tagline: "Timeless Signatures",
    description: "Our most coveted designs, celebrated by discerning patrons.",
    image:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Wedding Season",
    slug: "wedding-season",
    tagline: "Regal Elegance",
    description: "Bespoke bridal lehengas, pure Banarasi brocades, and ceremonial finery.",
    image:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Festive Edit",
    slug: "festive-edit",
    tagline: "Artisanal Radiance",
    description: "Lush velvets and hand-embroidered Anarkalis made for celebrations.",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function CollectionsPage() {
  return (
    <div className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Curated Edits
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
            Signature Collections
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            Thoughtfully assembled wardrobes exploring distinct themes, moods, and heritage weaving traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/shop/collection/${col.slug}`}
              className="group relative aspect-[16/10] bg-neutral-900 overflow-hidden block"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-75 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-neutral-300">
                  {col.tagline}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight">
                  {col.title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-md line-clamp-2">
                  {col.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
