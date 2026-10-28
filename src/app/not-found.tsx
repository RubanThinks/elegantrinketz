import React from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Search, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I was browsing your store and couldn't find the page I was looking for. Can you assist me?`
  )}`;

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 text-center bg-background min-h-[70vh]">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#881337] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#881337]" />
          <span>Boutique Assistance</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight leading-snug">
          The Page You Requested Could Not Be Found
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light max-w-lg mx-auto">
          We apologize for the inconvenience. The garment, collection, or editorial link you are looking for may have been updated, moved, or is temporarily unavailable.
        </p>

        {/* Primary Helpful Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse All Creations</span>
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Search className="w-4 h-4" />
            <span>Search Catalog</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="pt-6">
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-[#881337] font-semibold underline underline-offset-4"
          >
            &larr; Return to Boutique Home
          </Link>
        </div>
      </div>
    </div>
  );
}
