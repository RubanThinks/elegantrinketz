"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAnnouncementSettings, DEFAULT_ANNOUNCEMENT } from "@/services/storefront";
import type { AnnouncementSettings } from "@/types";

export function AnnouncementBar() {
  const [settings, setSettings] = useState<AnnouncementSettings>(DEFAULT_ANNOUNCEMENT);

  useEffect(() => {
    let active = true;
    getAnnouncementSettings().then((res) => {
      if (active && res) {
        setSettings(res);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!settings.enabled) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-gradient-to-r from-[#4c0519] via-[#881337] to-[#78350f] text-white text-[11px] sm:text-xs tracking-wide py-2.5 px-3 text-center border-b border-amber-400/30 select-none shadow-xs font-sans"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap font-bold">
        {settings.badgeText && (
          <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-black uppercase tracking-wider text-rose-950 shadow-xs">
            {settings.badgeText}
          </span>
        )}
        <span className="text-rose-100">{settings.message}</span>
        {settings.linkHref && settings.linkText && (
          <Link
            href={settings.linkHref}
            className="inline-flex items-center gap-1 font-extrabold text-amber-300 hover:text-white hover:underline transition-colors ml-1 uppercase text-[11px]"
          >
            <span>{settings.linkText}</span>
            <ArrowRight className="w-3 h-3 text-amber-300" aria-hidden="true" />
          </Link>
        )}
      </div>
    </aside>
  );
}
