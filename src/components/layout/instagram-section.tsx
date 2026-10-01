import React from "react";
import { Palette, Sparkles, MessageCircle, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: Palette,
    title: "Thoughtful Styles",
    description: "Every piece is curated with attention to silhouette, comfort, and contemporary elegance.",
  },
  {
    icon: Sparkles,
    title: "Women's Fashion",
    description: "From everyday kurtis to special occasion sets — fashion designed for the modern Indian woman.",
  },
  {
    icon: Heart,
    title: "Everyday Elegance",
    description: "Styles that seamlessly transition from casual outings to festive celebrations.",
  },
  {
    icon: MessageCircle,
    title: "Easy Ordering",
    description: "Browse, choose, and order via WhatsApp — simple, personal, and hassle-free.",
  },
];

export function InstagramSection() {
  return (
    <section className="py-16 sm:py-22 bg-white border-t border-[#e8e0d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-12 space-y-3">
          <div className="w-10 h-px bg-[#D4AF37] mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            Why {siteConfig.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#888] font-light">
            What makes us your go-to destination for women&apos;s fashion.
          </p>
        </div>

        {/* 4-Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-[#fff9f5] border border-[#e8e0d8] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1a1a1a]">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#888] leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
