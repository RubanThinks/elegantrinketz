import React from "react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { MessageSquareCheck, ArrowRight } from "lucide-react";

export function CampaignBanner() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I would like to place an order or check size availability.`
  )}`;

  return (
    <section className="w-full py-8 sm:py-10 bg-neutral-900 text-white border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <MessageSquareCheck className="w-3.5 h-3.5" />
              <span>Direct WhatsApp Shopping</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-flipkart">
              Need Size Advice or Instant Ordering?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-normal max-w-xl">
              Chat directly with our Salem customer support on WhatsApp for quick stock confirmation, custom sizing help, and fast local dispatch.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all font-flipkart cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Order on WhatsApp</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
