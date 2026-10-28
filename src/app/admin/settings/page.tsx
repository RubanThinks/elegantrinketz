"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Share2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  Sliders,
} from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "@/services/settings";
import type { SiteSettings } from "@/types";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "address" | "social">("general");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setFeedback({ type: "error", message: "Failed to load site settings. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      await updateSiteSettings(settings);
      setFeedback({ type: "success", message: "Settings saved and applied successfully!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Failed to update site settings:", err);
      setFeedback({ type: "error", message: "Failed to save settings. Please verify permissions." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
        <p className="text-sm font-semibold text-neutral-600">Loading site settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-rose-600" />
              <span>Store Settings</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-900 text-white shadow-xs">
              Live Config
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Manage your store branding, WhatsApp contact number, official email, dispatch location, and social links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                feedback.type === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <button
            type="button"
            onClick={loadSettings}
            disabled={isLoading || isSaving}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Solid Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-xs"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Branding & General</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "contact"
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-xs"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contact & WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("address")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "address"
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-xs"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Dispatch & Address</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "social"
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-xs"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Channels</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: General & Branding */}
        {activeTab === "general" && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900">Brand Identity & Regional Defaults</h2>
              <p className="text-xs text-neutral-500">Configure public business identity and currency settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  placeholder="e.g. Elegant Trinketz"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Currency Symbol & Code
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="INR"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                  placeholder="IN"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Custom Logo URL (Optional)
                </label>
                <input
                  type="text"
                  value={settings.logoUrl || ""}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="/logo.png or https://..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Contact & WhatsApp */}
        {activeTab === "contact" && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900">Direct Customer Support Channels</h2>
              <p className="text-xs text-neutral-500">
                Shoppers use these details to contact you directly for quick order help and sizing inquiries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  WhatsApp Support Number (without + or spaces)
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value.replace(/\D/g, "") })}
                  placeholder="e.g. 918838271225"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Example: 918838271225 (Country code 91 followed by 10-digit number)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Phone Number (Formatted for Display)
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 88382 71225"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="support@eleganttrinketz.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Address & Dispatch */}
        {activeTab === "address" && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900">Physical Store & Dispatch Address</h2>
              <p className="text-xs text-neutral-500">
                Printed on shipping labels, invoices, and the Contact page for physical returns.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Full Store Address
              </label>
              <textarea
                rows={4}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="3/76 A, Jeeva Street, Jagir Ammapalayam, Salem - 636302, Tamil Nadu, India"
                className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 4: Social Channels */}
        {activeTab === "social" && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900">Social Media Links</h2>
              <p className="text-xs text-neutral-500">
                Displayed in the footer and contact sections across the storefront.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/your_store"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={settings.facebookUrl}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/your_store"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <p className="text-xs text-neutral-500">
            Last updated: {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString("en-IN") : "Default configuration"}
          </p>

          <Button
            type="submit"
            disabled={isSaving}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm hover:shadow active:translate-y-px transition-all cursor-pointer flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

