import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  AnnouncementSettings,
  HeroSlide,
  DealOfTheDaySettings,
  CuratedSectionSettings,
  CuratedTileItem,
} from "@/types";
import { siteConfig } from "@/config/site";

const SETTINGS_COLLECTION = "siteSettings";
const ANNOUNCEMENT_DOC = "announcement";
const HERO_BANNERS_DOC = "heroBanners";
const DEAL_OF_THE_DAY_DOC = "dealOfTheDay";
const CURATED_STYLES_DOC = "curatedStyles";

/* ------------------------------------------------------------------ */
/*  DEFAULT FALLBACK DATA                                              */
/* ------------------------------------------------------------------ */

export const DEFAULT_ANNOUNCEMENT: AnnouncementSettings = {
  enabled: true,
  badgeText: "OFFER",
  message: "Free Delivery on all orders across India · Fast Dispatch & 100% Secure Checkout",
  linkText: "Shop Deals",
  linkHref: "/shop?sort=price_asc",
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    badge: "FESTIVE SALE · SPECIAL OFFERS",
    badgeColor: "#881337",
    title: "Timeless Festive Wear",
    highlight: "Handcrafted Luxury",
    subtitle: "Explore our latest curated additions made with premium fabrics and unmatched artisanal grace.",
    ctaText: "Shop Collection",
    ctaHref: "/shop",
    secondaryCtaText: "Explore More",
    secondaryCtaHref: "/shop",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
    isActive: true,
    order: 1,
  },
  {
    id: "slide-2",
    badge: "NEW ARRIVALS",
    badgeColor: "#be123c",
    title: "Signature Boutique Outfits",
    highlight: "Designed For You",
    subtitle: "Graceful silhouettes, vibrant shades, and premium handpicked fabrics for every celebration.",
    ctaText: "Shop New Styles",
    ctaHref: "/shop",
    secondaryCtaText: "All Products",
    secondaryCtaHref: "/shop",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85",
    isActive: true,
    order: 2,
  },
  {
    id: "slide-3",
    badge: "EXCLUSIVE COLLECTION",
    badgeColor: "#9f1239",
    title: "Everyday & Occasion Wear",
    highlight: "Pure Elegance",
    subtitle: "Ultra-comfortable fabrics engineered for all-day comfort and perfect drape.",
    ctaText: "Shop Outfits",
    ctaHref: "/shop",
    secondaryCtaText: "View Boutique",
    secondaryCtaHref: "/shop",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85",
    isActive: true,
    order: 3,
  },
];

export function getDefaultExpiryDate(): string {
  // 24 hours from now
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
}

export const DEFAULT_DEAL_OF_THE_DAY: DealOfTheDaySettings = {
  enabled: false,
  headline: "",
  subheadline: "",
  badgeText: "DEAL OF THE DAY",
  deals: [],
  productIds: [],
  startsAt: "",
  expiresAt: "",
};

/**
 * Checks whether the Deal of the Day is currently active and within its valid duration.
 */
export function isDealActive(settings?: DealOfTheDaySettings | null): boolean {
  if (!settings || !settings.enabled) return false;
  if (!settings.expiresAt) return false;

  const expiryTime = new Date(settings.expiresAt).getTime();
  if (isNaN(expiryTime) || expiryTime <= Date.now()) return false;

  if (settings.startsAt) {
    const startTime = new Date(settings.startsAt).getTime();
    if (!isNaN(startTime) && startTime > Date.now()) return false;
  }

  const hasDeals = Array.isArray(settings.deals) && settings.deals.length > 0;
  const hasProductIds = Array.isArray(settings.productIds) && settings.productIds.length > 0;

  return hasDeals || hasProductIds;
}

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
      const rawDeals = Array.isArray(data.deals) ? data.deals : [];
      const parsedDeals = rawDeals
        .filter((d: any) => d && typeof d.productId === "string")
        .map((d: any) => ({
          productId: d.productId,
          productName: d.productName || "",
          productImage: d.productImage || "",
          originalPrice: Number(d.originalPrice) || 0,
          dealPrice: Number(d.dealPrice) || 0,
          discountPercentage:
            d.discountPercentage ||
            (d.originalPrice && d.dealPrice && d.originalPrice > d.dealPrice
              ? Math.round(((d.originalPrice - d.dealPrice) / d.originalPrice) * 100)
              : 0),
        }));

      // Reconstruct productIds array for fast filtering
      const productIds = parsedDeals.length > 0
        ? parsedDeals.map((d: any) => d.productId)
        : Array.isArray(data.productIds)
        ? data.productIds
        : [];

      return {
        enabled: Boolean(data.enabled),
        headline: data.headline || "",
        subheadline: data.subheadline || "",
        badgeText: data.badgeText || "DEAL OF THE DAY",
        deals: parsedDeals,
        productIds,
        startsAt: data.startsAt || "",
        expiresAt: data.expiresAt || "",
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }
  } catch (err) {
    console.warn("[StorefrontService] Failed to load Deal of the Day settings:", err);
  }
  return { ...DEFAULT_DEAL_OF_THE_DAY };
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

export const DEFAULT_CURATED_SECTION: CuratedSectionSettings = {
  enabled: true,
  eyebrow: "CURATED BOUTIQUE",
  title: "Shop by Outfit Style",
  buttonText: "View All Collections",
  buttonHref: "/shop",
  tiles: [
    {
      id: "tile-1",
      title: "Festive Occasion Wear",
      tagline: "Artisanal Grace & Comfort",
      priceText: "Special Prices",
      href: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      badge: "Bestseller",
      order: 1,
      isActive: true,
    },
    {
      id: "tile-2",
      title: "Coordinated Festive Sets",
      tagline: "Complete Designer Pairs",
      priceText: "Curated Sets",
      href: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      badge: "Festive Ready",
      order: 2,
      isActive: true,
    },
    {
      id: "tile-3",
      title: "Flared Silhouette Drops",
      tagline: "Flowing Elegance & Ease",
      priceText: "Premium Selection",
      href: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
      badge: "Popular",
      order: 3,
      isActive: true,
    },
    {
      id: "tile-4",
      title: "Comfort Bottomwear",
      tagline: "Stretch Tailored Cuts",
      priceText: "Daily Comfort",
      href: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
      badge: "Essential",
      order: 4,
      isActive: true,
    },
    {
      id: "tile-5",
      title: "Sparkle & Shimmer",
      tagline: "Glow for Celebrations",
      priceText: "Trending Now",
      href: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
      badge: "Special Pick",
      order: 5,
      isActive: true,
    },
    {
      id: "tile-6",
      title: "Ethnic Festive Drops",
      tagline: "Handpicked Party Outfits",
      priceText: "Limited Edition",
      href: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
      badge: "Limited Stock",
      order: 6,
      isActive: true,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  CURATED STYLE TILES SERVICE                                       */
/* ------------------------------------------------------------------ */

export async function getCuratedSectionSettings(): Promise<CuratedSectionSettings> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, SETTINGS_COLLECTION, CURATED_STYLES_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const rawTiles = Array.isArray(data.tiles) ? data.tiles : [];
      const tiles: CuratedTileItem[] = rawTiles.map((t: any, idx: number) => ({
        id: t.id || `tile-${idx + 1}`,
        title: t.title || "Style Tile",
        tagline: t.tagline || "",
        priceText: t.priceText || "",
        href: t.href || "/shop",
        imageUrl: t.imageUrl || "",
        imagePublicId: t.imagePublicId || undefined,
        badge: t.badge || "",
        order: Number(t.order) || idx + 1,
        isActive: t.isActive !== false,
      }));

      return {
        enabled: data.enabled !== false,
        eyebrow: data.eyebrow || DEFAULT_CURATED_SECTION.eyebrow,
        title: data.title || DEFAULT_CURATED_SECTION.title,
        buttonText: data.buttonText || DEFAULT_CURATED_SECTION.buttonText,
        buttonHref: data.buttonHref || DEFAULT_CURATED_SECTION.buttonHref,
        tiles: tiles.sort((a, b) => a.order - b.order),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }
  } catch (err) {
    console.warn("[StorefrontService] Failed to load curated section settings:", err);
  }
  return { ...DEFAULT_CURATED_SECTION };
}

export async function saveCuratedSectionSettings(
  settings: Partial<CuratedSectionSettings>
): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, SETTINGS_COLLECTION, CURATED_STYLES_DOC);
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
