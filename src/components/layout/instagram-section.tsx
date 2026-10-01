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
    title: "Trendy Women's Fashion",
    description: "From everyday kurtis to festive 3-piece sets — fashion designed for the modern Indian woman.",
  },
  {
    icon: Heart,
    title: "Everyday Elegance",
    description: "Styles that seamlessly transition from casual brunches to family celebrations.",
  },
  {
    icon: MessageCircle,
    title: "Instant WhatsApp Orders",
    description: "Browse, choose, and order via WhatsApp — simple, personal, and hassle-free.",
  },
];

export function InstagramSection() {
  return (
    <section className="py-12 sm:py-18 bg-white border-t border-rose-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Elegant Promise</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-neutral-900 tracking-tight">
            Why Shop at {siteConfig.name}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-light">
            Your destination for contemporary fashion, curated designs, and easy shopping.
          </p>
        </div>

        {/* 4-Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center space-y-2.5 p-4 rounded-2xl bg-rose-50/30 border border-rose-100/60 hover:bg-rose-50/60 transition-colors"
              >
                <div className="w-11 h-11 mx-auto rounded-full bg-white border border-rose-200/80 shadow-xs flex items-center justify-center">
                  <Icon className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed font-light">
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
