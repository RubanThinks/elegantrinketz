"use client";

import React, { useState, useId } from "react";
import { Compass, ExternalLink, Link2, ChevronDown } from "lucide-react";

export interface RedirectionOption {
  label: string;
  href: string;
  group: string;
}

export const DEFAULT_REDIRECTIONS: RedirectionOption[] = [
  // Store Pages
  { label: "Shop All Products", href: "/shop", group: "Store Pages" },
  { label: "All Categories", href: "/categories", group: "Store Pages" },
  { label: "All Collections", href: "/collections", group: "Store Pages" },
  // Deals & Features
  { label: "Deals & Offers (Lowest Price First)", href: "/shop?sort=price_asc", group: "Deals & Collections" },
  { label: "New Arrivals Collection", href: "/shop/collection/new-arrivals", group: "Deals & Collections" },
  { label: "Best Sellers Collection", href: "/shop/collection/best-sellers", group: "Deals & Collections" },
  // Product Categories
  { label: "Side Cut Kurtis", href: "/shop/side-cut-kurtis", group: "Categories" },
  { label: "Umbrella Kurtis", href: "/shop/umbrella-kurtis", group: "Categories" },
  { label: "3-Piece Sets", href: "/shop/three-piece-sets", group: "Categories" },
  { label: "Straight Pants", href: "/shop/straight-pants", group: "Categories" },
  { label: "Shimmer Leggings", href: "/shop/shimmer-leggings", group: "Categories" },
  { label: "Ethnic & Festive Wear", href: "/shop/ethnic-wear", group: "Categories" },
  { label: "Accessories (Trinketz)", href: "/shop/accessories-trinketz", group: "Categories" },
  // Account & Support
  { label: "Customer Orders & Tracking", href: "/account/orders", group: "Customer Pages" },
  { label: "Contact & WhatsApp Support", href: "/contact", group: "Customer Pages" },
  { label: "Shipping Policy", href: "/shipping", group: "Customer Pages" },
  { label: "Returns & Exchanges", href: "/returns", group: "Customer Pages" },
];

interface RedirectionSelectorProps {
  value: string;
  onChange: (href: string) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
  allowCustom?: boolean;
}

export function RedirectionSelector({
  value,
  onChange,
  label = "Default Redirection",
  helperText,
  allowCustom = true,
}: RedirectionSelectorProps) {
  const selectId = useId();
  const matched = DEFAULT_REDIRECTIONS.find((r) => r.href === value);
  const isCustom = !matched && Boolean(value);
  const [showCustomInput, setShowCustomInput] = useState(isCustom);

  // Group options for select
  const groups = Array.from(new Set(DEFAULT_REDIRECTIONS.map((r) => r.group)));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "__custom__") {
      setShowCustomInput(true);
      // keep existing value or start clean
    } else {
      setShowCustomInput(false);
      onChange(selected);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="flex items-center justify-between text-xs font-bold text-neutral-800 uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-neutral-600" />
            <span>{label}</span>
          </span>
          {value && (
            <span className="text-[11px] font-mono font-medium text-neutral-500 normal-case bg-neutral-100 px-2 py-0.5 rounded shadow-xs">
              {value}
            </span>
          )}
        </label>
      )}

      {/* Solid Redirection Selector Dropdown */}
      <div className="relative">
        <select
          id={selectId}
          value={showCustomInput ? "__custom__" : (matched?.href || "")}
          onChange={handleSelectChange}
          className="w-full appearance-none bg-white text-neutral-900 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-sm transition-all pr-10 cursor-pointer"
        >
          <option value="">-- No Redirection (Inactive Link) --</option>
          {groups.map((group) => (
            <optgroup key={group} label={`📂 ${group}`} className="font-bold text-neutral-900">
              {DEFAULT_REDIRECTIONS.filter((r) => r.group === group).map((item) => (
                <option key={item.href} value={item.href} className="font-normal text-neutral-800">
                  {item.label} ({item.href})
                </option>
              ))}
            </optgroup>
          ))}
          {allowCustom && (
            <option value="__custom__" className="font-bold text-rose-700">
              ✏️ Custom URL / External Link...
            </option>
          )}
        </select>
        <ChevronDown className="w-4 h-4 text-neutral-500 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Custom URL Input (Only if custom mode chosen or custom link active) */}
      {showCustomInput && allowCustom && (
        <div className="pt-1.5 animate-fadeIn space-y-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. /shop?filter=featured or https://..."
                className="w-full px-3 py-2 bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                onChange("/shop");
              }}
              className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Reset to Preset
            </button>
          </div>
          <p className="text-[11px] text-neutral-500">
            Enter internal relative route starting with / or external https:// link.
          </p>
        </div>
      )}

      {helperText && !showCustomInput && (
        <p className="text-[11px] text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}

