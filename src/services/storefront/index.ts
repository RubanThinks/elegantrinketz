import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  AnnouncementSettings,
  HeroSlide,
  DealOfTheDaySettings,
} from "@/types";
import { siteConfig } from "@/config/site";

const SETTINGS_COLLECTION = "siteSettings";
const ANNOUNCEMENT_DOC = "announcement";
const HERO_BANNERS_DOC = "heroBanners";
const DEAL_OF_THE_DAY_DOC = "dealOfTheDay";

/* ------------------------------------------------------------------ */
/*  DEFAULT FALLBACK DATA                                              */
/* ------------------------------------------------------------------ */

export const DEFAULT_ANNOUNCEMENT: AnnouncementSettings = {
  enabled: true,
  badgeText: "OFFER",
  message: "Free Delivery on all orders across Salem · Instant styling help on WhatsApp",
  linkText: "Shop Deals",
  linkHref: "/shop?sort=price_asc",
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    badge: "FESTIVE SALE · FLAT 40% OFF",
    badgeColor: "#cc0c39",
    title: "Side Cut & Umbrella",
    highlight: "Kurtis from ₹499",
    subtitle: "Premium cotton and rayon fabrics tailored for supreme comfort and vibrant style.",
    ctaText: "Shop Kurtis",
    ctaHref: "/shop/side-cut-kurtis",
    secondaryCtaText: "View Umbrella",
    secondaryCtaHref: "/shop/umbrella-kurtis",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
    isActive: true,
    order: 1,
  },
  {
    id: "slide-2",
    badge: "NEW FESTIVE ARRIVALS",
    badgeColor: "#2874f0",
    title: "Designer 3-Piece Sets",
    highlight: "Under ₹999",
    subtitle: "Complete Kurti, Straight Pant & Chiffon Dupatta sets ready for every special occasion.",
    ctaText: "Shop 3-Piece Sets",
    ctaHref: "/shop/three-piece-sets",
    secondaryCtaText: "All Festive",
    secondaryCtaHref: "/shop/ethnic-wear",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85",
    isActive: true,
    order: 2,
  },
  {
    id: "slide-3",
    badge: "ESSENTIAL BOTTOMWEAR",
    badgeColor: "#059669",
    title: "Straight Pants & Shimmer",
    highlight: "Leggings from ₹299",
    subtitle: "Ultra-stretch, non-fade fabrics engineered for all-day comfort and perfect drape.",
    ctaText: "Shop Bottomwear",
    ctaHref: "/shop/straight-pants",
    secondaryCtaText: "Shimmer Leggings",
    secondaryCtaHref: "/shop/shimmer-leggings",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85",
    isActive: true,
    order: 3,
  },
];

export function getDefaultExpiryDate(): string {
  // Tomorrow at 12:00 PM (noon)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow.toISOString();
}

export const DEFAULT_DEAL_OF_THE_DAY: DealOfTheDaySettings = {
  enabled: true,
  headline: "Top Steals on Kurtis & Sets",
  subheadline: "Limited stock offers with up to 50% discount",
  badgeText: "DEAL OF THE DAY",
  productIds: [],
  expiresAt: getDefaultExpiryDate(),
};

/* ------------------------------------------------------------------ */
/*  ANNOUNCEMENT BANNER SERVICE                                       */
/* ------------------------------------------------------------------ */

export async function getAnnouncementSettings(): Promise<AnnouncementSettings> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, SETTINGS_COLLECTION, ANNOUNCEMENT_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        enabled: data.enabled !== false,
        badgeText: data.badgeText || DEFAULT_ANNOUNCEMENT.badgeText,
        message: data.message || DEFAULT_ANNOUNCEMENT.message,
        linkText: data.linkText || DEFAULT_ANNOUNCEMENT.linkText,
        linkHref: data.linkHref || DEFAULT_ANNOUNCEMENT.linkHref,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }
  } catch (err) {
    console.warn("[StorefrontService] Failed to load announcement settings:", err);
  }
  return DEFAULT_ANNOUNCEMENT;
}

export async function saveAnnouncementSettings(
  settings: Partial<AnnouncementSettings>
): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, SETTINGS_COLLECTION, ANNOUNCEMENT_DOC);
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/* ------------------------------------------------------------------ */
/*  HERO CAROUSEL SLIDES SERVICE                                       */
/* ------------------------------------------------------------------ */

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, SETTINGS_COLLECTION, HERO_BANNERS_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        return data.slides
          .map((s: any, idx: number) => ({
            id: s.id || `slide-${idx + 1}`,
            badge: s.badge || "SPECIAL OFFER",
            badgeColor: s.badgeColor || "#cc0c39",
            title: s.title || "Featured Collection",
            highlight: s.highlight || "",
            subtitle: s.subtitle || "",
            ctaText: s.ctaText || "Shop Now",
            ctaHref: s.ctaHref || "/shop",
            secondaryCtaText: s.secondaryCtaText || "Explore",
            secondaryCtaHref: s.secondaryCtaHref || "/categories",
            imageUrl: s.imageUrl || DEFAULT_HERO_SLIDES[0].imageUrl,
            isActive: s.isActive !== false,
            order: typeof s.order === "number" ? s.order : idx + 1,
          }))
          .sort((a: HeroSlide, b: HeroSlide) => a.order - b.order);
      }
    }
  } catch (err) {
    console.warn("[StorefrontService] Failed to load hero slides:", err);
  }
  return DEFAULT_HERO_SLIDES;
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, SETTINGS_COLLECTION, HERO_BANNERS_DOC);
  await setDoc(
    docRef,
    {
      slides,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/* ------------------------------------------------------------------ */
/*  DEAL OF THE DAY SERVICE                                            */
/* ------------------------------------------------------------------ */

export async function getDealOfTheDaySettings(): Promise<DealOfTheDaySettings> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, SETTINGS_COLLECTION, DEAL_OF_THE_DAY_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        enabled: data.enabled !== false,
        headline: data.headline || DEFAULT_DEAL_OF_THE_DAY.headline,
        subheadline: data.subheadline || DEFAULT_DEAL_OF_THE_DAY.subheadline,
        badgeText: data.badgeText || DEFAULT_DEAL_OF_THE_DAY.badgeText,
        productIds: Array.isArray(data.productIds) ? data.productIds : [],
        expiresAt: data.expiresAt || getDefaultExpiryDate(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }
  } catch (err) {
    console.warn("[StorefrontService] Failed to load Deal of the Day settings:", err);
  }
  return {
    ...DEFAULT_DEAL_OF_THE_DAY,
    expiresAt: getDefaultExpiryDate(),
  };
}

export async function saveDealOfTheDaySettings(
  settings: Partial<DealOfTheDaySettings>
): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, SETTINGS_COLLECTION, DEAL_OF_THE_DAY_DOC);
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
