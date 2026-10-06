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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAnnouncementSettings,
  saveAnnouncementSettings,
  getHeroSlides,
  saveHeroSlides,
  getDealOfTheDaySettings,
  saveDealOfTheDaySettings,
  DEFAULT_ANNOUNCEMENT,
  DEFAULT_HERO_SLIDES,
  DEFAULT_DEAL_OF_THE_DAY,
} from "@/services/storefront";
import { getAdminProducts } from "@/services/products";
import type {
  AnnouncementSettings,
  HeroSlide,
  DealOfTheDaySettings,
  Product,
} from "@/types";

type TabType = "announcement" | "hero" | "deal";

export default function AdminStorefrontPage() {
  const [activeTab, setActiveTab] = useState<TabType>("announcement");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [annRes, heroRes, dealRes, prodRes] = await Promise.all([
        getAnnouncementSettings(),
        getHeroSlides(),
        getDealOfTheDaySettings(),
        getAdminProducts({ pageSize: 100 }),
      ]);
      setAnnouncement(annRes);
      setHeroSlides(heroRes);
      setDealSettings(dealRes);
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
      badgeColor: "#cc0c39",
      title: "New Festive Style",
      highlight: "Kurtis & Sets from ₹499",
      subtitle: "Handcrafted comfort and vibrant styles tailored for modern celebrations.",
      ctaText: "Shop Collection",
      ctaHref: "/shop",
      secondaryCtaText: "View Categories",
      secondaryCtaHref: "/categories",
      imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
      isActive: true,
      order: heroSlides.length + 1,
    };
    setHeroSlides([...heroSlides, newSlide]);
    setEditingSlideIndex(heroSlides.length);
  };

  // Delete slide
  const handleDeleteSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert("At least one slide is required.");
      return;
    }
    const updated = heroSlides.filter((_, i) => i !== index);
    setHeroSlides(updated);
    if (editingSlideIndex >= updated.length) {
      setEditingSlideIndex(Math.max(0, updated.length - 1));
    }
  };

  // Move slide up/down
  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= heroSlides.length) return;

    const updated = [...heroSlides];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;

    // update order indices
    updated.forEach((s, i) => {
      s.order = i + 1;
    });

    setHeroSlides(updated);
    setEditingSlideIndex(target);
  };

  // 3. Save Deal of the Day
  const handleSaveDealOfTheDay = async () => {
    setIsSaving(true);
    try {
      await saveDealOfTheDaySettings(dealSettings);
      triggerSuccess("Deal of the Day settings saved successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to save deal settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Expiry Setters
  const setQuickExpiry = (type: "midnight" | "noon_tomorrow" | "24h" | "48h") => {
    const d = new Date();
    if (type === "midnight") {
      d.setHours(23, 59, 59, 999);
    } else if (type === "noon_tomorrow") {
      d.setDate(d.getDate() + 1);
      d.setHours(12, 0, 0, 0);
    } else if (type === "24h") {
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
    } else if (type === "48h") {
      d.setTime(d.getTime() + 48 * 60 * 60 * 1000);
    }
    setDealSettings((prev) => ({ ...prev, expiresAt: d.toISOString() }));
  };

  // Toggle product selection in Deal of the Day
  const toggleDealProduct = (productId: string) => {
    setDealSettings((prev) => {
      const exists = prev.productIds.includes(productId);
      const nextIds = exists
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId];
      return { ...prev, productIds: nextIds };
    });
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
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Storefront Customization
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700">
              Homepage Controls
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Customize the top announcement banner, hero promotional slider, and Deal of the Day offers in real time.
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "announcement"
              ? "bg-neutral-900 text-white shadow-xs"
              : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
          }`}
        >
          Top Announcement Bar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "hero"
              ? "bg-neutral-900 text-white shadow-xs"
              : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
          }`}
        >
          Hero Carousel ({heroSlides.length} Slides)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("deal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "deal"
              ? "bg-neutral-900 text-white shadow-xs"
              : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
          }`}
        >
          ⚡ Deal of the Day ({dealSettings.productIds.length} Selected)
        </button>
      </div>

      {/* TAB 1: ANNOUNCEMENT BANNER */}
      {activeTab === "announcement" && (
        <div className="space-y-6">
          {/* Live Preview Box */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-flipkart">
                Live Storefront Preview
              </span>
              <span className="text-[11px] text-neutral-400">Updates across all customer devices</span>
            </div>

            {announcement.enabled ? (
              <div className="bg-neutral-950 text-white text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 flex-wrap font-bold font-flipkart border border-neutral-800">
                {announcement.badgeText && (
                  <span className="px-1.5 py-0.2 rounded bg-red-600 text-[10px] font-black uppercase tracking-wider text-white">
                    {announcement.badgeText}
                  </span>
                )}
                <span>{announcement.message || "Enter your announcement message..."}</span>
                {announcement.linkHref && announcement.linkText && (
                  <span className="inline-flex items-center gap-1 font-extrabold text-[#ff9f00] uppercase text-[11px] ml-1">
                    <span>{announcement.linkText}</span>
                    <span>→</span>
                  </span>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-neutral-300 text-center text-xs text-neutral-400">
                Announcement banner is currently disabled (hidden from storefront)
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 font-flipkart">
                  Banner Visibility &amp; Content
                </h3>
                <p className="text-xs text-neutral-500">
                  Control the top offer announcement displayed at the very top of every page.
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
                <span className="ml-2 text-xs font-semibold text-neutral-700">
                  {announcement.enabled ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={announcement.badgeText}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, badgeText: e.target.value })
                  }
                  placeholder="e.g. OFFER, SALE, FESTIVE"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Action Link Text
                </label>
                <input
                  type="text"
                  value={announcement.linkText}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, linkText: e.target.value })
                  }
                  placeholder="e.g. Shop Deals, View Offers"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Announcement Message
                </label>
                <input
                  type="text"
                  value={announcement.message}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, message: e.target.value })
                  }
                  placeholder="e.g. Free Delivery on all orders across Salem · Instant styling help on WhatsApp"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={announcement.linkHref}
                  onChange={(e) =>
                    setAnnouncement({ ...announcement, linkHref: e.target.value })
                  }
                  placeholder="e.g. /shop?sort=price_asc or /shop/side-cut-kurtis"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={isSaving}
                className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
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
          {/* Header & Add Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 font-flipkart">
                Promotional Hero Slides
              </h3>
              <p className="text-xs text-neutral-500">
                Manage the big carousel banners on the top of the homepage.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSlide}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add New Slide
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Slide Navigation List */}
            <div className="lg:col-span-4 space-y-2.5">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  onClick={() => setEditingSlideIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    editingSlideIndex === idx
                      ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10 shadow-xs"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 overflow-hidden relative shrink-0 border border-neutral-200">
                      {slide.imageUrl && (
                        <Image
                          src={slide.imageUrl}
                          alt={slide.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate font-flipkart">
                        {slide.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {slide.highlight || slide.badge}
                      </p>
                      <span className={`inline-block w-2 h-2 rounded-full mt-1 ${slide.isActive ? "bg-emerald-500" : "bg-neutral-300"}`} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, "up")}
                      className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === heroSlides.length - 1}
                      onClick={() => handleMoveSlide(idx, "down")}
                      className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer ml-1"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Editor Panel */}
            {heroSlides[editingSlideIndex] && (
              <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
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
                      {heroSlides[editingSlideIndex].isActive ? "Enabled" : "Hidden"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].badge}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].badge = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. FESTIVE SALE · FLAT 40% OFF"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Badge Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={heroSlides[editingSlideIndex].badgeColor || "#cc0c39"}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[editingSlideIndex].badgeColor = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className="w-9 h-9 p-0.5 rounded-lg border border-neutral-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={heroSlides[editingSlideIndex].badgeColor || "#cc0c39"}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[editingSlideIndex].badgeColor = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Main Title
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].title}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].title = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. Side Cut & Umbrella"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Highlight Sub-Title (Gold/Accent)
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].highlight}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].highlight = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. Kurtis from ₹499"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Description / Hook Text
                    </label>
                    <textarea
                      rows={2}
                      value={heroSlides[editingSlideIndex].subtitle}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].subtitle = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. Premium cotton and rayon fabrics tailored for supreme comfort and vibrant style."
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
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
                      placeholder="e.g. Shop Kurtis"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Primary Button URL
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].ctaHref}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].ctaHref = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. /shop/side-cut-kurtis"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
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
                      placeholder="e.g. View Umbrella"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Secondary Button URL
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].secondaryCtaHref}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].secondaryCtaHref = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. /shop/umbrella-kurtis"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 font-flipkart">
                      Background Image URL
                    </label>
                    <input
                      type="text"
                      value={heroSlides[editingSlideIndex].imageUrl}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[editingSlideIndex].imageUrl = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="e.g. https://images.unsplash.com/... or Cloudinary URL"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveHeroSlides}
                    disabled={isSaving}
                    className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
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
          {/* Settings Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 font-flipkart">
                  ⚡ Deal of the Day Configuration
                </h3>
                <p className="text-xs text-neutral-500">
                  Select which products are featured in the Lightning Deal section and set the countdown timer.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dealSettings.enabled}
                  onChange={(e) =>
                    setDealSettings({ ...dealSettings, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-semibold text-neutral-700">
                  {dealSettings.enabled ? "Active" : "Disabled"}
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
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
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
                  placeholder="e.g. Top Steals on Kurtis & Sets"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>
            </div>

            {/* Countdown Expiration Controls */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 font-flipkart">
                Deal Expiry / Countdown Timer Ends At:
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setQuickExpiry("noon_tomorrow")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tomorrow 12:00 PM (Noon)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry("midnight")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tonight at Midnight (11:59 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry("24h")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  +24 Hours from Now
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
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                The countdown timer on the storefront will tick down in real-time to this exact timestamp.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveDealOfTheDay}
                disabled={isSaving}
                className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSaving ? "Saving..." : "Save Deal of the Day"}
              </Button>
            </div>
          </div>

          {/* Product Picker Matrix */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 font-flipkart">
                  Select Featured Products ({dealSettings.productIds.length} Selected)
                </h4>
                <p className="text-xs text-neutral-500">
                  Pick the styles that appear in the Deal of the Day grid.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU..."
                  className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>

            {/* Product selection list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto no-scrollbar p-1">
              {filteredProducts.map((p) => {
                const isSelected = dealSettings.productIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleDealProduct(p.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
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
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="text-[10px] font-bold text-[#388e3c]">
                          Save ₹{p.compareAtPrice - p.price}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-neutral-950 border-neutral-950 text-white"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
