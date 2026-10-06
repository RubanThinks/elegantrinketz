import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description: `Learn about ${siteConfig.name} — contemporary women's fashion with elegant silhouettes designed for every occasion.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-10 h-px bg-[#D4AF37] mx-auto" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            Our Story
          </h1>
          <p className="text-sm sm:text-base text-[#666] leading-relaxed font-light max-w-2xl mx-auto">
            {siteConfig.name} brings together contemporary women&apos;s fashion with elegant silhouettes, 
            expressive colors, and styles designed for everyday moments and special occasions.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-[2px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white p-3 flex items-center justify-center">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={150}
                height={150}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="relative aspect-[16/9] bg-[#f8f4f0] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80"
            alt="Women's fashion styling"
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed font-light text-[#555]">
          <p>
            At {siteConfig.name}, true to our motto &ldquo;{siteConfig.tagline}&rdquo;, we believe
            fashion should inspire confidence and charm. Our signature collections feature Side Cut
            Kurtis, Umbrella Kurtis, 3 Piece Sets, Straight Pants, and Shimmer Leggings, alongside
            hand-picked Accessories (Trinketz) — designed to elevate every wardrobe with modern grace.
          </p>
          <p>
            From everyday wear to festive celebrations, each design is chosen for quality, comfort,
            and timeless style. Visit our boutique in Jagir Ammapalayam, Salem or order seamlessly through WhatsApp.
          </p>
        </div>

        {/* Contact info */}
        <div className="border-t border-[#e8e0d8] pt-8 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
            Visit Us
          </p>
          <div className="text-sm text-[#666] space-y-0.5">
            <p>{siteConfig.address.street},</p>
            <p>{siteConfig.address.area},</p>
            <p>{siteConfig.address.city} - {siteConfig.address.pincode},</p>
            <p>{siteConfig.address.state}, {siteConfig.address.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
