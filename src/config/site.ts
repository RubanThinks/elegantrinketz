/**
 * Centralized site configuration for Elegant Trinketz.
 *
 * ALL business-identity values live here.
 * Components must import from this file instead of hardcoding names, URLs, etc.
 */

export const siteConfig = {
  /** Brand identity */
  name: "Elegant Trinketz",
  tagline: "Elegance in Every Dress",
  description:
    "Discover contemporary women's fashion — side cut kurtis, umbrella kurtis, 3-piece sets, straight pants, shimmer leggings and accessories. Elegant styles designed for every occasion.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://eleganttrinketz.com",

  /** Locale & currency */
  currency: "INR" as const,
  currencySymbol: "₹",
  country: "IN" as const,
  locale: "en-IN" as const,

  /** Brand assets */
  logo: "/logo.png",
  logoDark: "/logo-dark.png",
  favicon: "/logo.png",
  previewImage: "/logo.png",
  ogImage: "/logo.png",

  /** Contact */
  email: "",
  phone: "+91 78452 03893",
  phoneNumbers: ["+91 78452 03893", "+91 88382 71225"],
  whatsappNumber: "917845203893",
  whatsappNumberFormatted: "+91 78452 03893",
  address: {
    street: "3/76 A, Jeeva Street",
    area: "Jagir Ammapalayam",
    city: "Salem",
    pincode: "636302",
    state: "Tamil Nadu",
    country: "India",
  },

  /** Formatted full address */
  get fullAddress(): string {
    const a = this.address;
    return `${a.street}, ${a.area}, ${a.city} - ${a.pincode}, ${a.state}, ${a.country}`;
  },

  /** Product categories the business currently offers */
  categories: [
    "Side Cut Kurtis",
    "Umbrella Kurtis",
    "3 Piece Sets",
    "Straight Pants",
    "Shimmer Leggings",
    "Ethnic & Festive Wear",
    "Accessories (Trinketz)",
  ] as const,

  /** Social media URLs — only include verified accounts */
  social: {
    instagram: "",
    facebook: "",
    whatsapp: "https://wa.me/917845203893",
  },

  /** SEO defaults */
  seo: {
    titleTemplate: "%s | Elegant Trinketz",
    defaultTitle: "Elegant Trinketz — Elegance in Every Dress",
    openGraph: {
      type: "website" as const,
      locale: "en_IN",
      siteName: "Elegant Trinketz",
    },
    twitter: {
      cardType: "summary_large_image" as const,
    },
  },

  /** Announcement bar */
  announcement: {
    enabled: true,
    message: "New side cut kurtis & 3-piece sets now available — Order via WhatsApp for instant delivery",
    link: "/shop",
    linkText: "Shop Now",
  },
} as const;

export type SiteConfig = typeof siteConfig;
