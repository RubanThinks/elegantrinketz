import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Sparkles, ArrowRight } from "lucide-react";

export function AnnouncementBar() {
  if (!siteConfig.announcement.enabled) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white text-[11px] sm:text-xs tracking-wide py-1.5 px-3 text-center shadow-xs select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap font-medium">
        <Sparkles className="w-3 h-3 text-pink-200 shrink-0 animate-pulse" aria-hidden="true" />
        <span>{siteConfig.announcement.message}</span>
        {siteConfig.announcement.link && (
          <Link
            href={siteConfig.announcement.link}
            className="inline-flex items-center gap-0.5 font-bold text-white underline underline-offset-2 hover:text-pink-100 transition-colors ml-1"
          >
            <span>{siteConfig.announcement.linkText || "Shop Now"}</span>
            <ArrowRight className="w-3 h-3 ml-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </aside>
  );
}
