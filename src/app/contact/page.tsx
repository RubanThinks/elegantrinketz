import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Phone, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name} for product inquiries, orders, and assistance.`,
  path: "/contact",
});

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${siteConfig.name}, I have an inquiry.`
  )}`;

  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-10 h-px bg-[#D4AF37] mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            Get in Touch
          </h1>
          <p className="text-sm text-[#666] leading-relaxed font-light max-w-md mx-auto">
            We&apos;d love to hear from you. Reach out for product inquiries, order assistance, or any questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details Card */}
          <div className="border border-[#e8e0d8] bg-white p-8 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-xs shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-[2px]">
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={44}
                    height={44}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1a1a1a]">
                  {siteConfig.name}
                </h2>
                <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-medium">
                  {siteConfig.tagline}
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-[#e8e0d8]" />

            <div className="space-y-5 text-sm text-[#666]">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#1a1a1a] mb-1">Phone</p>
                  {siteConfig.phoneNumbers.map((num) => (
                    <a
                      key={num}
                      href={`tel:${num.replace(/[^0-9+]/g, "")}`}
                      className="block hover:underline text-[#666] mb-0.5"
                    >
                      {num}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#1a1a1a] mb-1">WhatsApp</p>
                  <div className="space-y-1">
                    <a
                      href={`https://wa.me/917845203893?text=${encodeURIComponent(
                        `Hello ${siteConfig.name}, I have an inquiry.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:underline text-[#25D366] font-medium"
                    >
                      +91 78452 03893 (Primary)
                    </a>
                    <a
                      href={`https://wa.me/918838271225?text=${encodeURIComponent(
                        `Hello ${siteConfig.name}, I have an inquiry.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:underline text-[#25D366] font-medium"
                    >
                      +91 88382 71225 (Support)
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#1a1a1a] mb-1">Address</p>
                  <div className="text-[#666]">
                    <p>{siteConfig.address.street},</p>
                    <p>{siteConfig.address.area},</p>
                    <p>{siteConfig.address.city} - {siteConfig.address.pincode},</p>
                    <p>{siteConfig.address.state}, {siteConfig.address.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`tel:${siteConfig.phoneNumbers[0].replace(/[^0-9+]/g, "")}`}
                className="flex-1 py-2.5 bg-[#111] text-white text-xs uppercase tracking-wider font-medium text-center hover:bg-black transition-colors"
              >
                Call Now
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-[#25D366] text-white text-xs uppercase tracking-wider font-medium text-center hover:bg-[#20BD5A] transition-colors flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="border border-[#e8e0d8] bg-white p-8 space-y-4">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">
              Send a Message
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-3 py-2 border border-[#e8e0d8] text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888] mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="w-full px-3 py-2 border border-[#e8e0d8] text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888] mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full px-3 py-2 border border-[#e8e0d8] text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
                />
              </div>
              <button
                type="button"
                className="w-full py-2.5 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
