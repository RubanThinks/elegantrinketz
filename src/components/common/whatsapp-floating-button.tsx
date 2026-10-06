"use client";

import React, { useState } from "react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { cn } from "@/lib/utils";

export function WhatsAppFloatingButton() {
  const [isHovered, setIsHovered] = useState(false);

  // If no whatsapp number configured, do not render
  if (!siteConfig.whatsappNumber && !siteConfig.social.whatsapp) {
    return null;
  }

  const cleanNumber = siteConfig.whatsappNumber
    ? siteConfig.whatsappNumber.replace(/[^0-9]/g, "")
    : "";
  const whatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
        `Hello ${siteConfig.name}, I have an inquiry about your collections.`
      )}`
    : siteConfig.social.whatsapp;

  return (
    <aside
      aria-label="WhatsApp Support Concierge"
      className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 lg:bottom-8 lg:right-8 z-40 flex items-center gap-3 select-none pointer-events-auto"
    >
      {/* Friendly Tooltip / Greeting pill (desktop and hover state) */}
      <div
        className={cn(
          "hidden md:flex items-center bg-white text-neutral-800 text-xs font-medium px-3.5 py-2 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-neutral-100 transition-all duration-300 pointer-events-none",
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2"
        )}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
        Order &amp; Chat on WhatsApp
      </div>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.55)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 cursor-pointer"
      >
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" />

        {/* Pulse beacon for subtle friendly discovery */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>
      </a>
    </aside>
  );
}
