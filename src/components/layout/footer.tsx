import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/config/navigation";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { Phone, MapPin, Heart } from "lucide-react";

/**
 * Desktop-only footer.
 * On mobile, the app provides a native app experience with BottomNav,
 * keeping the screen lightweight and clutter-free without a bulky website footer.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I'd like to know more about your collections.`
  )}`;

  return (
    <footer className="hidden lg:block bg-gradient-to-b from-white via-rose-50/30 to-pink-50/50 text-neutral-600 pt-16 pb-12 border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Brand Statement / Editorial intro */}
        <div className="grid grid-cols-12 gap-12 pb-12 border-b border-rose-100/80">
          <div className="col-span-5 space-y-4">
            {/* Logo with Pink-Gold Halo */}
            <Link
              href="/"
              className="inline-flex items-center gap-3.5 group"
              aria-label={`${siteConfig.name} — Home`}
            >
              <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-rose-400 via-pink-300 to-rose-500 shadow-sm shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-[2px]">
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={46}
                    height={46}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif italic font-bold text-xl tracking-wide text-neutral-900 group-hover:text-rose-600 transition-colors">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-medium">
                  {siteConfig.tagline}
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>

            {/* Direct WhatsApp Callout Pill */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                <span>Instant Styling & Orders on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="col-span-7 grid grid-cols-3 gap-8">
            {footerNavigation.map((col) => (
              <div key={col.title} className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-rose-200/60 pb-1.5 inline-block">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-xs text-neutral-500 hover:text-rose-600 transition-colors hover:translate-x-0.5 inline-block"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Location */}
        <div className="pt-8 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} {siteConfig.name}. Designed with</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>in Chennai, India.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {siteConfig.address.city}, {siteConfig.address.state}
            </span>
            <span className="text-neutral-300">·</span>
            <a
              href={`tel:${siteConfig.phoneNumbers[0].replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-1 hover:text-rose-600 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-rose-500" />
              {siteConfig.phoneNumbers[0]}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
