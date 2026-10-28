import React from "react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { MessageSquareCheck, ArrowRight } from "lucide-react";

export function CampaignBanner() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I need sizing help and styling advice for your collection.`
  )}`;

  return (
    <section className="w-full py-8 sm:py-10 bg-neutral-900 text-white border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider">
              <MessageSquareCheck className="w-3.5 h-3.5" />
              <span>Personal Styling & Sizing Support</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-flipkart">
              Unsure About Fit or Styling?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-normal max-w-xl">
              Connect directly with our styling team for custom measurements, fabric details, and real-time support.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all font-flipkart cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              <span>Get Sizing Help</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
