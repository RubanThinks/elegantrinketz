import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/config/navigation";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I'd like to know more about your collections.`
  )}`;

  return (
    <footer className="bg-[#111111] text-[#999] pt-16 pb-10 border-t border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Statement / Editorial intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#333]">
          <div className="lg:col-span-4 space-y-5">
            {/* Logo in Circular Placeholder */}
            <Link
              href="/"
              className="inline-flex items-center gap-3.5 group"
              aria-label={`${siteConfig.name} — Home`}
            >
              <div className="relative w-12 h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-md shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-[2px]">
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif font-bold text-lg text-white tracking-wide group-hover:text-[#D4AF37] transition-colors">
                  {siteConfig.name}
                </span>
                <span className="text-[9.5px] uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
                  {siteConfig.tagline}
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#888] font-light leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-[#999]">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <div className="text-xs leading-relaxed">
                  <p>{siteConfig.address.street},</p>
                  <p>{siteConfig.address.area},</p>
                  <p>{siteConfig.address.city} - {siteConfig.address.pincode},</p>
                  <p>{siteConfig.address.state}, {siteConfig.address.country}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-[#999]">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div className="text-xs space-y-0.5">
                  {siteConfig.phoneNumbers.map((num) => (
                    <a
                      key={num}
                      href={`tel:${num.replace(/[^0-9+]/g, "")}`}
                      className="block hover:text-white transition-colors"
                    >
                      {num}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#25D366]/40 text-[#25D366] text-xs font-medium rounded-sm hover:bg-[#25D366]/10 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerNavigation.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#E6C76A] font-medium">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-[#999] hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Gold accent line */}
        <div className="pt-8">
          {/* Gold decorative line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#666] gap-4">
            <p>
              © {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-[11px] text-[#555]">
              <span>Region: {siteConfig.country}</span>
              <span>Currency: {siteConfig.currency} ({siteConfig.currencySymbol})</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
