import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";

export function CampaignBanner() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I found a style I love and would like to place an order.`
  )}`;

  return (
    <section className="w-full relative overflow-hidden py-16 sm:py-20 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-[#111111] text-white p-8 sm:p-14 lg:p-16 shadow-2xl">
          {/* Subtle Ambient Background image */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-30 md:opacity-40 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80"
              alt="Fashion styling"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl space-y-5">
            {/* Gold decorative line */}
            <div className="w-12 h-px bg-[#D4AF37]" />

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-[1.15]">
              Found Your Style?
            </h2>

            <p className="text-sm sm:text-base text-[#ccc] font-light leading-relaxed">
              Chat with {siteConfig.name} on WhatsApp to place your order, check 
              availability, or get styling advice. We&apos;re here to help you find the perfect piece.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>

              <span className="text-xs text-[#888]">
                Replies within minutes
              </span>
            </div>

            {/* Gold decorative accent */}
            <div className="pt-4">
              <div className="w-24 h-px bg-gradient-to-r from-[#D4AF37] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
