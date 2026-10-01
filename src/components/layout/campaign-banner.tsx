import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { Sparkles } from "lucide-react";

export function CampaignBanner() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I found a style I love and would like to place an order.`
  )}`;

  return (
    <section className="w-full relative overflow-hidden py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 text-white p-7 sm:p-12 lg:p-14 shadow-xl shadow-rose-600/20">
          {/* Ambient Background image overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-25 md:opacity-30 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80"
              alt="Fashion styling"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-rose-600/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-lg space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-200" />
              <span>Instant Personal Shopping</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif italic font-bold tracking-tight text-white leading-[1.15]">
              Found Your Perfect Style?
            </h2>

            <p className="text-xs sm:text-sm text-pink-100 font-light leading-relaxed">
              Order directly on WhatsApp with {siteConfig.name}. Send us a screenshot or product title for instant size verification, styling help, and quick dispatch.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#25D366]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>

              <span className="text-xs text-pink-200 font-medium">
                ⚡ Replies within minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
