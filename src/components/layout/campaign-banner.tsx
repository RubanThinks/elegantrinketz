import React from "react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { MessageSquareCheck, ArrowRight, Sparkles } from "lucide-react";

export function CampaignBanner() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I need sizing help and styling advice for your collection.`
  )}`;

  return (
    <section className="w-full py-8 sm:py-10 bg-rose-50/60 border-y border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-interlocked-triangles-luxury p-6 sm:p-8 rounded-2xl border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Personal Styling &amp; Sizing Concierge</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
              Unsure About Fit, Size or Fabric?
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 font-normal max-w-xl leading-relaxed">
              Connect directly with our Salem boutique team for custom measurements, fabric details, and real-time styling assistance.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 relative z-10">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:translate-y-px transition-all cursor-pointer font-sans"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-4 h-4 ml-0.5 text-white" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
