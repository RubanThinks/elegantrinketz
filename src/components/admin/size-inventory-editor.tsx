"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductSize } from "@/types";
import { calculateProductInventory } from "@/services/products";

interface SizeInventoryEditorProps {
  sizes: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
}

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export function SizeInventoryEditor({
  sizes,
  onChange,
}: SizeInventoryEditorProps) {
  const [customSizeName, setCustomSizeName] = useState("");

  const { totalStock, inventoryStatus } = calculateProductInventory(sizes);

  // Add a size preset or custom size
  const handleAddSize = (name: string) => {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return;

    // Prevent duplicate size IDs
    if (sizes.some((s) => s.name.toUpperCase() === trimmed)) {
      return;
    }

    const newSize: ProductSize = {
      id: trimmed,
      name: trimmed,
      stock: 5, // sensible starting default
      isAvailable: true,
    };

    onChange([...sizes, newSize]);
    setCustomSizeName("");
  };

  // Update stock with strict non-negative enforcement
  const handleStockChange = (index: number, valueStr: string) => {
    const rawVal = parseInt(valueStr, 10);
    const cleanStock = isNaN(rawVal) ? 0 : Math.max(0, rawVal);

    const updated = sizes.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          stock: cleanStock,
          isAvailable: cleanStock > 0, // strictly derived availability
        };
      }
      return item;
    });

    onChange(updated);
  };

  // Remove a size variant
  const handleRemoveSize = (index: number) => {
    const updated = sizes.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header and Aggregate Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Variants & Stock Inventory
          </h3>
          <p className="text-xs text-neutral-500">
            Variant-level inventory management. Negative values are prevented automatically.
          </p>
        </div>

        {/* Global Inventory Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Total Stock:</span>
          <span className="text-sm font-bold text-neutral-900 font-mono">
            {totalStock}
          </span>
          {inventoryStatus === "in_stock" && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
            </Badge>
          )}
          {inventoryStatus === "low_stock" && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[11px]">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
            </Badge>
          )}
          {inventoryStatus === "out_of_stock" && (
            <Badge className="bg-red-50 text-red-700 border-red-200 gap-1 text-[11px]">
              <XCircle className="w-3 h-3 text-red-600" /> Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Add Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
          Quick Add Standard Sizes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SIZES.map((sz) => {
            const alreadyAdded = sizes.some((s) => s.name.toUpperCase() === sz.toUpperCase());
            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleAddSize(sz)}
                disabled={alreadyAdded}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  alreadyAdded
                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900 hover:text-neutral-950"
                }`}
              >
                + {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Size Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customSizeName}
          onChange={(e) => setCustomSizeName(e.target.value)}
          placeholder="Custom size label (e.g., 38, UK 10, Free Size)"
          className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddSize(customSizeName);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddSize(customSizeName)}
          disabled={!customSizeName.trim()}
          className="shrink-0 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom
        </Button>
      </div>

      {/* Size Variants Table */}
      {sizes.length > 0 ? (
        <div className="border border-neutral-200/90 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-12 bg-neutral-50 px-4 py-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
            <div className="col-span-4">Size Name</div>
            <div className="col-span-4">Available Units</div>
            <div className="col-span-3">State</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="divide-y divide-neutral-100">
            {sizes.map((item, index) => {
              const stockStatus =
                item.stock === 0
                  ? "out_of_stock"
                  : item.stock <= 3
                  ? "low_stock"
                  : "in_stock";

              return (
                <div
                  key={item.id || item.name}
                  className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="col-span-4 font-semibold text-xs text-neutral-900">
                    {item.name}
                  </div>

                  <div className="col-span-4 pr-4">
                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={(e) => handleStockChange(index, e.target.value)}
                      className="w-24 px-2 py-1 border border-neutral-300 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div className="col-span-3">
                    {stockStatus === "in_stock" && (
                      <span className="text-[11px] font-medium text-emerald-600">
                        Available
                      </span>
                    )}
                    {stockStatus === "low_stock" && (
                      <span className="text-[11px] font-medium text-amber-600">
                        Low ({item.stock})
                      </span>
                    )}
                    {stockStatus === "out_of_stock" && (
                      <span className="text-[11px] font-medium text-red-600">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove size variant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-neutral-300 rounded-xl p-6 text-center text-xs text-neutral-400">
          No size variants added yet. Click one of the standard sizes above or add custom sizing.
        </div>
      )}
    </div>
  );
}
