import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowRight } from "lucide-react";

export function AnnouncementBar() {
  if (!siteConfig.announcement.enabled) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-[#111111] text-[#f8dce5] text-[11px] sm:text-xs tracking-wider uppercase py-2 px-4 text-center transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
        <span>{siteConfig.announcement.message}</span>
        {siteConfig.announcement.link && (
          <Link
            href={siteConfig.announcement.link}
            className="inline-flex items-center gap-1 font-semibold text-[#D4AF37] underline underline-offset-2 hover:text-[#E6C76A] transition-colors"
          >
            <span>{siteConfig.announcement.linkText || "Learn More"}</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    </aside>
  );
}
