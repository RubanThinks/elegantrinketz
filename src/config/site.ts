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
    "Discover contemporary women's fashion — kurtis, 3-piece sets, straight pants, shimmer leggings and more. Elegant styles designed for every occasion.",
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

  /** Contact */
  email: "",
  phone: "+91 93452 46835",
  phoneNumbers: ["+91 93452 46835", "+91 98404 18605"],
  whatsappNumber: "919345246835",
  address: {
    street: "No 27/5, C1, 1st floor, Anna Nagar 2nd Avenue",
    area: "Block C, C Block, Anna Nagar",
    city: "Chennai",
    pincode: "600040",
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
    "Kids Wear",
    "Women's Wear",
    "Western Wear",
    "Ethnic Wear",
    "Gowns / Frocks",
    "Festive & Party Wear",
    "Accessories (Trinketz)",
  ] as const,

  /** Social media URLs — only include verified accounts */
  social: {
    instagram: "",
    facebook: "",
    whatsapp: "https://wa.me/919345246835",
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
    message: "New styles now available — Order via WhatsApp for easy shopping",
    link: "/shop",
    linkText: "Shop Now",
  },
} as const;

export type SiteConfig = typeof siteConfig;
