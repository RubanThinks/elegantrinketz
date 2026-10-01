import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { SiteSettings } from "@/types";
import { siteConfig } from "@/config/site";

const SETTINGS_COLLECTION = "siteSettings";
const GLOBAL_SETTINGS_DOC = "global";

/**
 * Fetch global site settings.
 * Falls back to siteConfig if no Firestore document is present yet.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        businessName: data.businessName || siteConfig.name,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        whatsappNumber: data.whatsappNumber || siteConfig.whatsappNumber,
        email: data.email || siteConfig.email,
        phone: data.phone || siteConfig.phone,
        instagramUrl: data.instagramUrl || siteConfig.social.instagram,
        facebookUrl: data.facebookUrl || siteConfig.social.facebook,
        address: typeof data.address === "string" ? data.address : siteConfig.fullAddress,
        currency: data.currency || siteConfig.currency,
        country: data.country || siteConfig.country,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn("[SettingsService] Error loading site settings from Firestore:", error);
  }

  // Frontend fallback
  return {
    businessName: siteConfig.name,
    whatsappNumber: siteConfig.whatsappNumber,
    email: siteConfig.email,
    phone: siteConfig.phone,
    instagramUrl: siteConfig.social.instagram,
    facebookUrl: siteConfig.social.facebook,
    address: siteConfig.fullAddress,
    currency: siteConfig.currency,
    country: siteConfig.country,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update global site settings (restricted to super_admin).
 */
export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
  await setDoc(docRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}
