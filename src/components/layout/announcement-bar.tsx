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
      className="bg-neutral-950 text-white text-[11px] sm:text-xs tracking-wide py-2 px-3 text-center border-b border-neutral-800 select-none font-flipkart"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap font-bold">
        {settings.badgeText && (
          <span className="px-1.5 py-0.2 rounded bg-red-600 text-[10px] font-black uppercase tracking-wider text-white">
            {settings.badgeText}
          </span>
        )}
        <span>{settings.message}</span>
        {settings.linkHref && settings.linkText && (
          <Link
            href={settings.linkHref}
            className="inline-flex items-center gap-1 font-extrabold text-[#ff9f00] hover:underline transition-colors ml-1 uppercase text-[11px]"
          >
            <span>{settings.linkText}</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    </aside>
  );
}
