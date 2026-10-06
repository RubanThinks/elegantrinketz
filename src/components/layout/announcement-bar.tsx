import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Sparkles, ArrowRight } from "lucide-react";

export function AnnouncementBar() {
  if (!siteConfig.announcement.enabled) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-neutral-950 text-white text-[11px] sm:text-xs tracking-wide py-2 px-3 text-center border-b border-neutral-800 select-none font-flipkart"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap font-bold">
        <span className="px-1.5 py-0.2 rounded bg-red-600 text-[10px] font-black uppercase tracking-wider text-white">
          Offer
        </span>
        <span>{siteConfig.announcement.message}</span>
        {siteConfig.announcement.link && (
          <Link
            href={siteConfig.announcement.link}
            className="inline-flex items-center gap-1 font-extrabold text-[#ff9f00] hover:underline transition-colors ml-1 uppercase text-[11px]"
          >
            <span>{siteConfig.announcement.linkText || "Shop Deals"}</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    </aside>
  );
}
