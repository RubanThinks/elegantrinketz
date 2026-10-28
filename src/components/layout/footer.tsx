import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/config/navigation";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { Phone, MapPin, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I would like to inquire about products and sizing.`
  )}`;

  return (
    <footer className="bg-interlocked-triangles-luxury text-rose-100/90 pt-16 pb-12 border-t-2 border-amber-500/40 font-sans shadow-2xl relative block overflow-hidden">
      {/* Radiant Glow Vignette */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Trust Row — Pink & Gold Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pb-10 border-b border-amber-500/30">
          <div className="flex items-center gap-3.5 bg-rose-950/70 border border-amber-500/30 p-4 rounded-xl shadow-md">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-rose-950 shadow-sm shrink-0">
              <Truck className="w-5 h-5 text-rose-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider font-serif">Fast Express Shipping</p>
              <p className="text-[11px] text-rose-200/80">Free delivery on orders across Salem & Tamil Nadu</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-rose-950/70 border border-amber-500/30 p-4 rounded-xl shadow-md">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-rose-950 shadow-sm shrink-0">
              <RotateCcw className="w-5 h-5 text-rose-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider font-serif">7-Day Easy Exchange</p>
              <p className="text-[11px] text-rose-200/80">Hassle-free size and fit replacements</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-rose-950/70 border border-amber-500/30 p-4 rounded-xl shadow-md">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-rose-950 shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-rose-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider font-serif">100% Quality Fabric</p>
              <p className="text-[11px] text-rose-200/80">Premium handcrafted cotton, rayon & silk blends</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Brand Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 py-12 border-b border-amber-500/30">
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label={`${siteConfig.name} — Home`}
            >
              <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-rose-400 shadow-md shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1px] flex items-center justify-center">
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif italic font-bold text-xl text-white tracking-wide">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                  Women&apos;s Fashion &amp; Trinketz
                </span>
              </div>
            </Link>

            <p className="text-xs text-rose-100/80 leading-relaxed max-w-sm">
              Your premier boutique for trending Side Cut Kurtis, Umbrella Kurtis, Festive 3-Piece Sets, Straight Pants, and Shimmer Leggings.
            </p>

            {/* Direct Official WhatsApp Support Button */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:translate-y-px"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {footerNavigation.map((col) => (
              <div key={col.title} className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300 pb-1 border-b border-amber-500/20 font-serif">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {(col.links || []).map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-xs text-rose-100/80 hover:text-amber-200 transition-colors font-medium block"
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rose-200/70">
          <div>
            <span>&copy; {currentYear} {siteConfig.name}. All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-rose-200/80">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {siteConfig.address.city}, {siteConfig.address.state} - {siteConfig.address.pincode}
            </span>
            <span className="text-amber-500/50 hidden sm:inline">·</span>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              {siteConfig.phoneNumbers.map((phone, idx) => (
                <React.Fragment key={phone}>
                  {idx > 0 && <span className="text-amber-500/50">/</span>}
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="hover:text-amber-200 transition-colors"
                  >
                    {phone}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
