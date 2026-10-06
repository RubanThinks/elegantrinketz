import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/config/navigation";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { Phone, MapPin, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I would like to inquire about products and sizing.`
  )}`;

  return (
    <footer className="hidden lg:block bg-neutral-950 text-neutral-400 pt-16 pb-12 border-t border-neutral-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top Trust Row */}
        <div className="grid grid-cols-3 gap-6 pb-10 border-b border-neutral-800/80 text-neutral-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <Truck className="w-5 h-5 text-[#ff9f00]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider font-flipkart">Fast Express Shipping</p>
              <p className="text-[11px] text-neutral-400">Free delivery on orders across Salem</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider font-flipkart">7-Day Easy Exchange</p>
              <p className="text-[11px] text-neutral-400">Hassle-free size and fit exchanges</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider font-flipkart">100% Quality Fabric</p>
              <p className="text-[11px] text-neutral-400">Direct from workshop to your wardrobe</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-12 gap-12 py-12 border-b border-neutral-800/80">
          <div className="col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label={`${siteConfig.name} — Home`}
            >
              <div className="w-10 h-10 rounded-full border border-neutral-700 bg-white p-[1px] shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={38}
                    height={38}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-lg text-white font-flipkart tracking-tight">
                  {siteConfig.name}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-rose-500 font-bold">
                  Women&apos;s Fashion Online
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Your one-stop destination for trending Side Cut Kurtis, Umbrella Kurtis, Festive 3-Piece Sets, Straight Pants, and Shimmer Leggings.
            </p>

            {/* Direct WhatsApp Callout */}
            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold uppercase tracking-wider transition-colors font-flipkart"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Order Support on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="col-span-8 grid grid-cols-4 gap-6">
            {footerNavigation.map((col) => (
              <div key={col.title} className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-white pb-1 border-b border-neutral-800 font-flipkart">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {(col.links || []).map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-xs text-neutral-400 hover:text-white transition-colors"
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
          <div>
            <span>&copy; {currentYear} {siteConfig.name}. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              {siteConfig.address.city}, {siteConfig.address.state} - {siteConfig.address.pincode}
            </span>
            <span className="text-neutral-700">·</span>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              <a
                href={`tel:${siteConfig.phoneNumbers[0].replace(/[^0-9+]/g, "")}`}
                className="hover:text-white transition-colors"
              >
                {siteConfig.phoneNumbers[0]}
              </a>
              <span className="text-neutral-700">/</span>
              <a
                href={`tel:${siteConfig.phoneNumbers[1].replace(/[^0-9+]/g, "")}`}
                className="hover:text-white transition-colors"
              >
                {siteConfig.phoneNumbers[1]}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
