"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Sliders,
  Clock,
  Save,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Eye,
  Zap,
  Tag,
  Search,
  CheckCircle2,
  RefreshCw,
  Upload,
  ImageIcon,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RedirectionSelector } from "@/components/admin/redirection-selector";
import { uploadToCloudinary } from "@/lib/cloudinary/client";
import {
  getAnnouncementSettings,
  saveAnnouncementSettings,
  getHeroSlides,
  saveHeroSlides,
  getDealOfTheDaySettings,
  saveDealOfTheDaySettings,
  getCuratedSectionSettings,
  saveCuratedSectionSettings,
  DEFAULT_ANNOUNCEMENT,
  DEFAULT_HERO_SLIDES,
  DEFAULT_DEAL_OF_THE_DAY,
  DEFAULT_CURATED_SECTION,
} from "@/services/storefront";
import { getAdminProducts } from "@/services/products";
import type {
  AnnouncementSettings,
  HeroSlide,
  DealOfTheDaySettings,
  DealProductConfig,
  CuratedSectionSettings,
  CuratedTileItem,
  Product,
} from "@/types";

type TabType = "announcement" | "hero" | "deal" | "curated";

export default function AdminStorefrontPage() {
  const [activeTab, setActiveTab] = useState<TabType>("announcement");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Announcement State
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(DEFAULT_ANNOUNCEMENT);

  // Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number>(0);

  // Deal of the Day State
  const [dealSettings, setDealSettings] = useState<DealOfTheDaySettings>(DEFAULT_DEAL_OF_THE_DAY);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Curated Style Section State ("Shop by Outfit Style")
  const [curatedSettings, setCuratedSettings] = useState<CuratedSectionSettings>(DEFAULT_CURATED_SECTION);
  const [editingTileIndex, setEditingTileIndex] = useState<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [annRes, heroRes, dealRes, curatedRes, prodRes] = await Promise.all([
        getAnnouncementSettings(),
        getHeroSlides(),
        getDealOfTheDaySettings(),
        getCuratedSectionSettings(),
        getAdminProducts({ pageSize: 100 }),
      ]);
      setAnnouncement(annRes);
      setHeroSlides(heroRes);
      setDealSettings(dealRes);
      setCuratedSettings(curatedRes);
      setAllProducts(prodRes.products);
    } catch (err) {
      console.error("Failed to load storefront settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // 1. Save Announcement
  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    try {
      await saveAnnouncementSettings(announcement);
      triggerSuccess("Announcement banner updated successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to save announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Save Hero Slides
  const handleSaveHeroSlides = async () => {
    setIsSaving(true);
    try {
      await saveHeroSlides(heroSlides);
      triggerSuccess("Hero promotional slides saved successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to save hero slides.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add new slide
  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      badge: "LIMITED OFFER",
      badgeColor: "#881337",
      title: "New Festive Style",
      highlight: "Kurtis & Sets from ₹499",
      subtitle: "Handcrafted comfort and vibrant styles tailored for modern celebrations.",
      ctaText: "Shop Collection",
      ctaHref: "/shop",
      secondaryCtaText: "View Categories",
      secondaryCtaHref: "/categories",
      imageUrl: "",
      isActive: true,
      order: heroSlides.length + 1,
    };
    setHeroSlides([...heroSlides, newSlide]);
    setEditingSlideIndex(heroSlides.length);
  };

  // Delete slide
  const handleDeleteSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert("You must keep at least one slide.");
      return;
    }
    const updated = heroSlides.filter((_, i) => i !== index);
    updated.forEach((s, i) => {
      s.order = i + 1;
    });
    setHeroSlides(updated);
    setEditingSlideIndex(Math.max(0, updated.length - 1));
  };

  // Move slide up/down
  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= heroSlides.length) return;

    const updated = [...heroSlides];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;

    updated.forEach((s, i) => {
      s.order = i + 1;
    });

    setHeroSlides(updated);
    setEditingSlideIndex(target);
  };

  // Upload hero slide image via Choose File
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadToCloudinary(
        file,
        "fashion-store/hero-slides",
        "primary",
        slideIndex,
        `Hero Slide ${slideIndex + 1}`
      );
      const updated = [...heroSlides];
      updated[slideIndex].imageUrl = res.url;
      setHeroSlides(updated);
      triggerSuccess("Slide image uploaded successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to upload slide image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Deal of the Day Handlers
  const handleAddProductToDeal = (product: Product) => {
    setDealSettings((prev) => {
      const currentDeals = prev.deals || [];
      if (currentDeals.some((d) => d.productId === product.id)) return prev;

      const suggestedDealPrice = Math.max(1, Math.round(product.price * 0.8));
      const newDealItem: DealProductConfig = {
        productId: product.id,
        productName: product.name,
        productImage: product.images?.primary || "",
        originalPrice: product.price,
        dealPrice: suggestedDealPrice,
        discountPercentage: Math.round(((product.price - suggestedDealPrice) / product.price) * 100),
      };

      const updatedDeals = [...currentDeals, newDealItem];
      return {
        ...prev,
        deals: updatedDeals,
        productIds: updatedDeals.map((d) => d.productId),
      };
    });
  };

  const handleRemoveProductFromDeal = (productId: string) => {
    setDealSettings((prev) => {
      const updatedDeals = (prev.deals || []).filter((d) => d.productId !== productId);
      return {
        ...prev,
        deals: updatedDeals,
        productIds: updatedDeals.map((d) => d.productId),
      };
    });
  };

  const handleUpdateDealPrice = (productId: string, newDealPrice: number) => {
    setDealSettings((prev) => {
      const updatedDeals = (prev.deals || []).map((d) => {
        if (d.productId !== productId) return d;
        const validPrice = Math.max(0, newDealPrice);
        const discountPercentage =
          d.originalPrice > validPrice
            ? Math.round(((d.originalPrice - validPrice) / d.originalPrice) * 100)
            : 0;
        return {
          ...d,
          dealPrice: validPrice,
          discountPercentage,
        };
      });
      return {
        ...prev,
        deals: updatedDeals,
      };
    });
  };

  const handleSaveDealOfTheDay = async () => {
    if (dealSettings.enabled) {
      if (!dealSettings.headline || !dealSettings.headline.trim()) {
        alert("Please provide a Deal Headline (e.g. 'Flash Deal of the Day') before activating.");
        return;
      }
      if (!dealSettings.expiresAt) {
        alert("Please set a valid Deal Expiry duration and end time.");
        return;
      }
      const expiry = new Date(dealSettings.expiresAt).getTime();
      if (isNaN(expiry) || expiry <= Date.now()) {
        alert("The Deal Expiry time must be in the future.");
        return;
      }
      if (!dealSettings.deals || dealSettings.deals.length === 0) {
        alert("Please assign at least one product with a reduced deal price before enabling.");
        return;
      }
      const invalidPrice = dealSettings.deals.find(
        (d) => d.dealPrice <= 0 || d.dealPrice >= d.originalPrice
      );
      if (invalidPrice) {
        alert(
          `Product "${invalidPrice.productName || invalidPrice.productId}" has an invalid deal price. The deal price (₹${invalidPrice.dealPrice}) must be greater than 0 and less than its regular price (₹${invalidPrice.originalPrice}).`
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      await saveDealOfTheDaySettings(dealSettings);
      triggerSuccess(
        dealSettings.enabled
          ? "Deal of the Day published successfully with active price reductions!"
          : "Deal of the Day settings saved (currently disabled)."
      );
    } catch (err) {
      alert((err as Error).message || "Failed to save deal settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDeal = async () => {
    if (!confirm("Are you sure you want to deactivate and clear the current Deal of the Day? The section will be completely removed from the storefront.")) {
      return;
    }
    const resetDeal: DealOfTheDaySettings = {
      enabled: false,
      headline: "",
      subheadline: "",
      badgeText: "DEAL OF THE DAY",
      deals: [],
      productIds: [],
      startsAt: "",
      expiresAt: "",
    };
    setIsSaving(true);
    try {
      await saveDealOfTheDaySettings(resetDeal);
      setDealSettings(resetDeal);
      triggerSuccess("Deal of the Day deactivated and cleared successfully.");
    } catch (err) {
      alert((err as Error).message || "Failed to clear deal.");
    } finally {
      setIsSaving(false);
    }
  };

  const setQuickExpiry = (type: "6h" | "12h" | "24h" | "48h" | "midnight" | "noon_tomorrow") => {
    const d = new Date();
    if (type === "6h") {
      d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
    } else if (type === "12h") {
      d.setTime(d.getTime() + 12 * 60 * 60 * 1000);
    } else if (type === "24h") {
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
    } else if (type === "48h") {
      d.setTime(d.getTime() + 48 * 60 * 60 * 1000);
    } else if (type === "midnight") {
      d.setHours(23, 59, 59, 999);
    } else if (type === "noon_tomorrow") {
      d.setDate(d.getDate() + 1);
      d.setHours(12, 0, 0, 0);
    }
    setDealSettings((prev) => ({ ...prev, expiresAt: d.toISOString() }));
  };

  // Curated Style Section Handlers
  const handleCuratedTileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tileIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadToCloudinary(
        file,
        "fashion-store/curated-tiles",
        "primary",
        tileIndex,
        `Style Tile ${tileIndex + 1}`
      );
      const updatedTiles = [...curatedSettings.tiles];
      updatedTiles[tileIndex].imageUrl = res.url;
      updatedTiles[tileIndex].imagePublicId = res.publicId;
      setCuratedSettings({
        ...curatedSettings,
        tiles: updatedTiles,
      });
      triggerSuccess("Style tile image uploaded successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to upload style tile image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCuratedTile = () => {
    const newTile: CuratedTileItem = {
      id: `tile-${Date.now()}`,
      title: "New Outfit Style",
      tagline: "Trending & Handcrafted",
      priceText: "From ₹499",
      href: "/shop",
      imageUrl: "",
      badge: "New",
      order: curatedSettings.tiles.length + 1,
      isActive: true,
    };
    const updated = [...curatedSettings.tiles, newTile];
    setCuratedSettings({ ...curatedSettings, tiles: updated });
    setEditingTileIndex(updated.length - 1);
  };

  const handleDeleteCuratedTile = (index: number) => {
    if (!confirm("Are you sure you want to delete this style tile?")) return;
    const updated = curatedSettings.tiles.filter((_, i) => i !== index);
    updated.forEach((t, i) => {
      t.order = i + 1;
    });
    setCuratedSettings({ ...curatedSettings, tiles: updated });
    setEditingTileIndex(Math.max(0, updated.length - 1));
  };

  const handleMoveCuratedTile = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= curatedSettings.tiles.length) return;

    const updated = [...curatedSettings.tiles];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;

    updated.forEach((t, i) => {
      t.order = i + 1;
    });

    setCuratedSettings({ ...curatedSettings, tiles: updated });
    setEditingTileIndex(target);
  };

  const handleSaveCuratedSection = async () => {
    setIsSaving(true);
    try {
      await saveCuratedSectionSettings(curatedSettings);
      triggerSuccess("Curated Outfit Style tiles saved successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to save style tiles.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight font-serif">
              Storefront Customization
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700">
              Homepage Controls
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Customize the announcement bar, hero promotional slider, deal of the day, and curated outfit tiles in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              {saveSuccess}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs (Mobile-Friendly Horizontal Scroll) */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "announcement"
              ? "bg-[#881337] text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shadow-xs"
          }`}
        >
          Top Announcement Bar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "hero"
              ? "bg-[#881337] text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shadow-xs"
          }`}
        >
          Hero Carousel ({heroSlides.length} Slides)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("deal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "deal"
              ? "bg-[#881337] text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shadow-xs"
          }`}
        >
          ⚡ Deal of the Day ({(dealSettings.deals || []).length} Products)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("curated")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "curated"
              ? "bg-[#881337] text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shadow-xs"
          }`}
        >
          👗 Curated Style Tiles ({curatedSettings.tiles.length} Tiles)
        </button>
      </div>

      {/* TAB 1: ANNOUNCEMENT BANNER */}
      {activeTab === "announcement" && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-flipkart">
                Live Storefront Preview
              </span>
              <span className="text-[11px] text-neutral-400">Updates across all customer devices</span>
            </div>

            {announcement.enabled ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#4a0418] via-[#7a0d2e] to-[#4a0418] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-xs">
                    {announcement.badgeText || "OFFER"}
                  </span>
                  <span className="text-xs font-medium text-rose-100">
                    {announcement.message || "Enter announcement message below"}
                  </span>
                </div>
                {announcement.linkText && (
                  <span className="text-xs font-bold text-amber-300 underline underline-offset-2 self-start sm:self-auto">
                    {announcement.linkText} →
                  </span>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-neutral-100 text-neutral-500 text-xs italic text-center">
                Announcement banner is currently disabled and hidden from customers.
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 font-flipkart">
                  Banner Visibility &amp; Content
                </h3>
                <p className="text-xs text-neutral-500">
                  Enable or update the top bar announcement message shown on every page.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-neutral-700">
                  {announcement.enabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={announcement.badgeText}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, badgeText: e.target.value })
                  }
                  placeholder="e.g. FLASH OFFER"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Announcement Message
                </label>
                <input
                  type="text"
                  value={announcement.message}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, message: e.target.value })
                  }
                  placeholder="e.g. Free Delivery on all prepaid orders across India"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Link Text (Optional)
                </label>
                <input
                  type="text"
                  value={announcement.linkText}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, linkText: e.target.value })
                  }
                  placeholder="e.g. Shop Now"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              <div className="md:col-span-3">
                <RedirectionSelector
                  value={announcement.linkHref}
                  onChange={(href) =>
                    setAnnouncement({ ...announcement, linkHref: href })
                  }
                  label="Target Redirection"
                  helperText="Select which store page or collection opens when the customer clicks the link."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={isSaving}
                className="bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSaving ? "Saving..." : "Save Announcement"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO CAROUSEL SLIDES */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Slides List ({heroSlides.length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSlide}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Slide
                </Button>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto no-scrollbar p-1">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    onClick={() => setEditingSlideIndex(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      editingSlideIndex === idx
                        ? "border-[#881337] bg-rose-50/50 ring-1 ring-[#881337]"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-10 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                        {slide.imageUrl ? (
                          <Image
                            src={slide.imageUrl}
                            alt={slide.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white"
                            style={{ backgroundColor: slide.badgeColor || "#881337" }}
                          >
                            {slide.badge || "SLIDE"}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 truncate font-flipkart">
                            {slide.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {slide.highlight}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, "down")}
                        disabled={idx === heroSlides.length - 1}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="p-1 rounded text-neutral-400 hover:text-red-600 cursor-pointer ml-1"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {heroSlides[editingSlideIndex] && (
              <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-flipkart">
                    Editing Slide #{editingSlideIndex + 1}
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heroSlides[editingSlideIndex].isActive}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].isActive = e.target.checked;
                        setHeroSlides(updated);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-xs font-semibold text-neutral-700">
                      {heroSlides[editingSlideIndex].isActive ? "Slide Active" : "Slide Hidden"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].badge}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].badge = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. FESTIVE SALE · SPECIAL OFFERS"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Badge Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={heroSlides[editingSlideIndex].badgeColor || "#881337"}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[editingSlideIndex].badgeColor = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className="w-9 h-9 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={heroSlides[editingSlideIndex].badgeColor || "#881337"}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[editingSlideIndex].badgeColor = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#881337]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Main Heading (Line 1)
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].title}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].title = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. Timeless Festive Wear"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Highlight Subtitle (Line 2)
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].highlight}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].highlight = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. Handcrafted Luxury"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Supporting Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={heroSlides[editingSlideIndex].subtitle}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].subtitle = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="Short editorial summary for modern boutique celebrations..."
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].ctaText}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].ctaText = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. Shop Collection"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <RedirectionSelector
                      value={heroSlides[editingSlideIndex].ctaHref}
                      onChange={(href) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].ctaHref = href;
                        setHeroSlides(updated);
                      }}
                      label="Primary Button Redirection"
                      helperText="Default redirection target for the primary button."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Secondary Button Text
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].secondaryCtaText}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].secondaryCtaText = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. Explore More"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <RedirectionSelector
                      value={heroSlides[editingSlideIndex].secondaryCtaHref}
                      onChange={(href) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].secondaryCtaHref = href;
                        setHeroSlides(updated);
                      }}
                      label="Secondary Button Redirection"
                      helperText="Default redirection target for the secondary button."
                    />
                  </div>

                  {/* Slide Background Image (Choose File Upload) */}
                  <div className="sm:col-span-2 pt-2 border-t border-neutral-100">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Background Image (Choose File)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {heroSlides[editingSlideIndex].imageUrl ? (
                        <div className="w-24 h-16 rounded-xl overflow-hidden relative shrink-0 border border-neutral-200 bg-neutral-100">
                          <Image
                            src={heroSlides[editingSlideIndex].imageUrl}
                            alt="Slide Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-[10px] text-center p-1 shrink-0 bg-neutral-50">
                          No photo
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage}
                          onChange={(e) => handleHeroImageUpload(e, editingSlideIndex)}
                          className="w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-neutral-200 file:text-xs file:font-bold file:bg-[#881337] file:text-white hover:file:bg-[#700f2d] file:cursor-pointer cursor-pointer shadow-xs"
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">
                          {isUploadingImage
                            ? "⏳ Uploading slide to Cloudinary..."
                            : "Choose an image file directly from your device storage."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveHeroSlides}
                    disabled={isSaving}
                    className="bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {isSaving ? "Saving..." : "Save All Hero Slides"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEAL OF THE DAY */}
      {activeTab === "deal" && (
        <div className="space-y-6">
          {(() => {
            const hasDeals = (dealSettings.deals || []).length > 0;
            const isExpired = Boolean(
              dealSettings.expiresAt &&
              new Date(dealSettings.expiresAt).getTime() <= Date.now()
            );
            const isLive = dealSettings.enabled && !isExpired && hasDeals;

            if (isLive) {
              const endsDate = new Date(dealSettings.expiresAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              });
              return (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Status: Live on Storefront
                      </span>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-emerald-900 mt-0.5">
                      The Deal of the Day section is active with{" "}
                      <strong>{dealSettings.deals.length} discounted product(s)</strong> until{" "}
                      <strong>{endsDate}</strong>. When this duration ends, the section will
                      automatically hide and product prices will revert to normal.
                    </p>
                  </div>
                </div>
              );
            }

            if (isExpired) {
              const endedDate = new Date(dealSettings.expiresAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              });
              return (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Status: Deal Expired
                    </span>
                    <p className="text-xs text-amber-900 mt-0.5">
                      The previous deal expired on <strong>{endedDate}</strong>. The Deal of the Day
                      section is <strong>hidden from customers</strong>. To reactivate, extend the
                      expiry date or update products below.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-start gap-3 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Status: Inactive / Not Configured
                  </span>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    No active Deal of the Day is configured. The section is{" "}
                    <strong>completely hidden from the storefront</strong>. Fill in the duration and
                    assign products below to launch a deal.
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 font-flipkart">
                  ⚡ Deal Duration &amp; Headline Settings
                </h3>
                <p className="text-xs text-neutral-500">
                  Configure the deal duration. While the deal is active, products show reduced prices.
                  Once expired, prices automatically revert to standard.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={dealSettings.enabled}
                  onChange={(e) =>
                    setDealSettings({ ...dealSettings, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-neutral-700">
                  {dealSettings.enabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={dealSettings.badgeText}
                  onChange={(e) =>
                    setDealSettings({ ...dealSettings, badgeText: e.target.value })
                  }
                  placeholder="e.g. DEAL OF THE DAY"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-semibold focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Deal Headline
                </label>
                <input
                  type="text"
                  value={dealSettings.headline}
                  onChange={(e) =>
                    setDealSettings({ ...dealSettings, headline: e.target.value })
                  }
                  placeholder="e.g. Exclusive Flash Deals or Festive Steals"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 font-flipkart">
                Deal Active Duration (Until this time, prices are reduced):
              </label>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setQuickExpiry("6h")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  6 Hours
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry("12h")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  12 Hours
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry("24h")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  24 Hours
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry("48h")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  48 Hours
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry("midnight")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tonight (11:59 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry("noon_tomorrow")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tomorrow (12:00 PM)
                </button>
              </div>

              <div className="flex items-center gap-2 max-w-sm">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="datetime-local"
                  value={
                    dealSettings.expiresAt
                      ? new Date(dealSettings.expiresAt).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const parsed = new Date(e.target.value);
                    if (!isNaN(parsed.getTime())) {
                      setDealSettings({ ...dealSettings, expiresAt: parsed.toISOString() });
                    }
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              {dealSettings.expiresAt && (
                <p className="text-[11px] text-neutral-500 mt-1.5 font-medium">
                  ⏳ Deal expires on{" "}
                  <strong>
                    {new Date(dealSettings.expiresAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </strong>
                  . When expired, prices automatically revert to the regular price.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearDeal}
                disabled={isSaving}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Deactivate &amp; Clear Deal
              </button>

              <Button
                type="button"
                onClick={handleSaveDealOfTheDay}
                disabled={isSaving}
                className="bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSaving ? "Saving..." : "Save & Publish Deal"}
              </Button>
            </div>
          </div>

          {/* Assigned Products in this Deal with Custom Reduced Prices */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 font-flipkart">
                  Assigned Deal Products ({(dealSettings.deals || []).length} Selected)
                </h4>
                <p className="text-xs text-neutral-500">
                  Set the reduced deal price for each product. During the active deal duration,
                  customers will pay this reduced price.
                </p>
              </div>
            </div>

            {(!dealSettings.deals || dealSettings.deals.length === 0) ? (
              <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                <p className="text-xs text-neutral-500 font-medium">
                  No products added to this deal yet.
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Browse your inventory below and click &quot;+ Add to Deal&quot; to assign products and set reduced prices.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dealSettings.deals.map((deal) => {
                  const savings = Math.max(0, deal.originalPrice - deal.dealPrice);
                  const isPriceInvalid = deal.dealPrice <= 0 || deal.dealPrice >= deal.originalPrice;

                  return (
                    <div
                      key={deal.productId}
                      className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-16 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                          {deal.productImage ? (
                            <Image
                              src={deal.productImage}
                              alt={deal.productName || "Product"}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-neutral-900 truncate font-flipkart">
                            {deal.productName || deal.productId}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                            Regular Price: <strong className="text-neutral-900">₹{deal.originalPrice}</strong>
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Until expiry, customer pays{" "}
                            <strong className="text-[#881337]">₹{deal.dealPrice}</strong>. After expiry, reverts to{" "}
                            <strong>₹{deal.originalPrice}</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                            Deal Reduced Price (₹)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={deal.originalPrice - 1}
                              value={deal.dealPrice || ""}
                              onChange={(e) =>
                                handleUpdateDealPrice(deal.productId, Number(e.target.value))
                              }
                              className={`w-28 px-3 py-1.5 border rounded-xl text-xs font-bold font-mono focus:outline-none ${
                                isPriceInvalid
                                  ? "border-red-500 text-red-600 bg-red-50"
                                  : "border-neutral-300 text-neutral-900 focus:border-[#881337]"
                              }`}
                            />
                            {savings > 0 && (
                              <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold whitespace-nowrap">
                                Save ₹{savings} ({deal.discountPercentage}% OFF)
                              </span>
                            )}
                          </div>
                          {isPriceInvalid && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">
                              Must be &lt; ₹{deal.originalPrice}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveProductFromDeal(deal.productId)}
                          className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer mt-4"
                          title="Remove from Deal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 font-flipkart">
                  Add Products from Catalog
                </h4>
                <p className="text-xs text-neutral-500">
                  Search your store inventory and click &quot;+ Add to Deal&quot; to include items.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU..."
                  className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto no-scrollbar p-1">
              {filteredProducts.map((p) => {
                const isSelected = (dealSettings.deals || []).some((d) => d.productId === p.id);

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-14 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                        {p.images?.primary ? (
                          <Image
                            src={p.images.primary}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-900 truncate font-flipkart">
                          {p.name}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-500">
                          ₹{p.price} · SKU: {p.sku}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveProductFromDeal(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-red-600 transition-colors group cursor-pointer"
                        >
                          <Check className="w-3 h-3 group-hover:hidden" />
                          <span className="group-hover:hidden">Added</span>
                          <span className="hidden group-hover:inline">Remove</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddProductToDeal(p)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CURATED STYLE TILES ("Shop by Outfit Style") */}
      {activeTab === "curated" && (
        <div className="space-y-6">
          {/* Header & Section Controls Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 font-flipkart">
                  👗 Curated Outfit Style Tiles Configuration
                </h3>
                <p className="text-xs text-neutral-500">
                  Customize the section header, badges, titles, offers, and department photos displayed on the storefront.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={curatedSettings.enabled}
                  onChange={(e) =>
                    setCuratedSettings({ ...curatedSettings, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-neutral-700">
                  {curatedSettings.enabled ? "Section Active" : "Section Disabled"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Section Eyebrow Label
                </label>
                <input
                  type="text"
                  value={curatedSettings.eyebrow}
                  onChange={(e) =>
                    setCuratedSettings({ ...curatedSettings, eyebrow: e.target.value })
                  }
                  placeholder="e.g. CURATED BOUTIQUE"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Section Main Headline
                </label>
                <input
                  type="text"
                  value={curatedSettings.title}
                  onChange={(e) =>
                    setCuratedSettings({ ...curatedSettings, title: e.target.value })
                  }
                  placeholder="e.g. Shop by Outfit Style"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Top Button Label
                </label>
                <input
                  type="text"
                  value={curatedSettings.buttonText}
                  onChange={(e) =>
                    setCuratedSettings({ ...curatedSettings, buttonText: e.target.value })
                  }
                  placeholder="e.g. View All Categories"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                />
              </div>

              <div>
                <RedirectionSelector
                  value={curatedSettings.buttonHref}
                  onChange={(href) =>
                    setCuratedSettings({ ...curatedSettings, buttonHref: href })
                  }
                  label="Top Button Redirection"
                  helperText="Destination when clicking the section header button."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveCuratedSection}
                disabled={isSaving}
                className="bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSaving ? "Saving..." : "Save Style Tiles Section"}
              </Button>
            </div>
          </div>

          {/* Tiles Manager Layout (Split view: Tile List + Live Tile Editor) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tile Cards List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Style Tiles ({curatedSettings.tiles.length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCuratedTile}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Style Tile
                </Button>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto no-scrollbar p-1">
                {curatedSettings.tiles.map((tile, idx) => (
                  <div
                    key={tile.id || idx}
                    onClick={() => setEditingTileIndex(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      editingTileIndex === idx
                        ? "border-[#881337] bg-rose-50/50 ring-1 ring-[#881337]"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-12 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                        {tile.imageUrl ? (
                          <Image
                            src={tile.imageUrl}
                            alt={tile.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-neutral-900 truncate font-flipkart">
                            {tile.title}
                          </p>
                          {tile.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#881337] text-white uppercase">
                              {tile.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#388e3c] font-bold mt-0.5">
                          {tile.priceText || "No offer set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleMoveCuratedTile(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCuratedTile(idx, "down")}
                        disabled={idx === curatedSettings.tiles.length - 1}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCuratedTile(idx)}
                        className="p-1 rounded text-neutral-400 hover:text-red-600 cursor-pointer ml-1"
                        title="Delete Tile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Tile Editor */}
            {curatedSettings.tiles[editingTileIndex] && (
              <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-flipkart">
                    Editing Style Tile #{editingTileIndex + 1}: {curatedSettings.tiles[editingTileIndex].title}
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={curatedSettings.tiles[editingTileIndex].isActive}
                      onChange={(e) => {
                        const updated = [...curatedSettings.tiles];
                        updated[editingTileIndex].isActive = e.target.checked;
                        setCuratedSettings({ ...curatedSettings, tiles: updated });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-xs font-semibold text-neutral-700">
                      {curatedSettings.tiles[editingTileIndex].isActive ? "Tile Active" : "Tile Hidden"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Tile Title
                    </label>
                    <input
                      type="text"
                      value={curatedSettings.tiles[editingTileIndex].title}
                      onChange={(e) => {
                        const updated = [...curatedSettings.tiles];
                        updated[editingTileIndex].title = e.target.value;
                        setCuratedSettings({ ...curatedSettings, tiles: updated });
                      }}
                      placeholder="e.g. Side Cut Kurtis"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Tile Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={curatedSettings.tiles[editingTileIndex].tagline}
                      onChange={(e) => {
                        const updated = [...curatedSettings.tiles];
                        updated[editingTileIndex].tagline = e.target.value;
                        setCuratedSettings({ ...curatedSettings, tiles: updated });
                      }}
                      placeholder="e.g. Trending Daily & Festive"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Badge Text (Corner Overlay)
                    </label>
                    <input
                      type="text"
                      value={curatedSettings.tiles[editingTileIndex].badge}
                      onChange={(e) => {
                        const updated = [...curatedSettings.tiles];
                        updated[editingTileIndex].badge = e.target.value;
                        setCuratedSettings({ ...curatedSettings, tiles: updated });
                      }}
                      placeholder="e.g. Bestseller, Festive Ready, Under ₹499"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Price Starting / Offer Text
                    </label>
                    <input
                      type="text"
                      value={curatedSettings.tiles[editingTileIndex].priceText}
                      onChange={(e) => {
                        const updated = [...curatedSettings.tiles];
                        updated[editingTileIndex].priceText = e.target.value;
                        setCuratedSettings({ ...curatedSettings, tiles: updated });
                      }}
                      placeholder="e.g. From ₹499 or Up to 40% Off"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-[#388e3c] focus:outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <RedirectionSelector
                      value={curatedSettings.tiles[editingTileIndex].href}
                      onChange={(href) => {
                        const updated = [...curatedSettings.tiles];
                        updated[editingTileIndex].href = href;
                        setCuratedSettings({ ...curatedSettings, tiles: updated });
                      }}
                      label="Tile Click Redirection Target"
                      helperText="Select which category, catalog, or collection is opened when this tile is clicked."
                    />
                  </div>

                  {/* Choose File Image Uploader */}
                  <div className="sm:col-span-2 pt-2 border-t border-neutral-100">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Tile Image (Choose File)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {curatedSettings.tiles[editingTileIndex].imageUrl ? (
                        <div className="w-20 h-24 rounded-xl overflow-hidden relative shrink-0 border border-neutral-200 bg-neutral-100">
                          <Image
                            src={curatedSettings.tiles[editingTileIndex].imageUrl}
                            alt="Tile Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-24 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-[10px] text-center p-1 shrink-0 bg-neutral-50">
                          No photo
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage}
                          onChange={(e) => handleCuratedTileImageUpload(e, editingTileIndex)}
                          className="w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-neutral-200 file:text-xs file:font-bold file:bg-[#881337] file:text-white hover:file:bg-[#700f2d] file:cursor-pointer cursor-pointer shadow-xs"
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">
                          {isUploadingImage
                            ? "⏳ Uploading image to Cloudinary..."
                            : "Choose an image file directly from your device."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveCuratedSection}
                    disabled={isSaving}
                    className="bg-[#881337] hover:bg-[#700f2d] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Style Tiles"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
