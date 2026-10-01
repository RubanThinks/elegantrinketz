"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Star,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  validateImageFile,
} from "@/lib/cloudinary/client";
import type { ProductMediaItem, ProductImageRoleType } from "@/types";

interface MediaManagerProps {
  media: ProductMediaItem[];
  onChange: (media: ProductMediaItem[]) => void;
  productName?: string;
  productId?: string;
}

export function MediaManager({
  media,
  onChange,
  productName = "Product",
  productId = "new",
}: MediaManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file uploads
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const folder = `fashion-store/products/${productId}`;
    const newItems: ProductMediaItem[] = [...media];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(`${file.name}: ${validation.error}`);
        }

        // Auto-assign roles based on current collection
        let role: ProductImageRoleType = "gallery";
        const hasPrimary = newItems.some((m) => m.role === "primary");
        const hasHover = newItems.some((m) => m.role === "hover");

        if (!hasPrimary) {
          role = "primary";
        } else if (!hasHover) {
          role = "hover";
        }

        const altText = `${productName} ${role} view`;

        const uploadedItem = await uploadToCloudinary(
          file,
          folder,
          role,
          newItems.length,
          altText
        );

        newItems.push(uploadedItem);
      }

      onChange(newItems);
    } catch (err) {
      setUploadError((err as Error).message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Set an image as primary
  const handleSetPrimary = (index: number) => {
    const updated = media.map((item, idx) => {
      if (idx === index) {
        return { ...item, role: "primary" as const };
      }
      if (item.role === "primary") {
        return { ...item, role: "gallery" as const };
      }
      return item;
    });
    onChange(updated);
  };

  // Set an image as hover
  const handleSetHover = (index: number) => {
    const updated = media.map((item, idx) => {
      if (idx === index) {
        return { ...item, role: "hover" as const };
      }
      if (item.role === "hover") {
        return { ...item, role: "gallery" as const };
      }
      return item;
    });
    onChange(updated);
  };

  // Delete an image and optionally purge from Cloudinary
  const handleDelete = async (index: number) => {
    const itemToDelete = media[index];
    if (!itemToDelete) return;

    if (itemToDelete.publicId) {
      // Fire-and-forget background delete from Cloudinary
      deleteFromCloudinary(itemToDelete.publicId).catch((err) =>
        console.warn("Could not delete from Cloudinary:", err)
      );
    }

    const updated = media.filter((_, idx) => idx !== index);

    // If deleted was primary and there are still images, elevate first to primary
    if (itemToDelete.role === "primary" && updated.length > 0) {
      updated[0] = { ...updated[0], role: "primary" };
    }

    onChange(updated);
  };

  // Move image left in order
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...media];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  // Move image right in order
  const handleMoveRight = (index: number) => {
    if (index === media.length - 1) return;
    const updated = [...media];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  // Update alt text
  const handleAltChange = (index: number, alt: string) => {
    const updated = [...media];
    updated[index] = { ...updated[index], alt };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Product Media & Visual Experience
          </h3>
          <p className="text-xs text-neutral-500">
            Manage Primary, Hover, and Gallery assets. Reorder or replace images at any time.
          </p>
        </div>
        <span className="text-xs font-mono text-neutral-400">
          {media.length} {media.length === 1 ? "image" : "images"}
        </span>
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          isDraggingOver
            ? "border-rose-500 bg-rose-50/50"
            : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/40"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
              <p className="text-xs font-semibold text-neutral-700">
                Uploading to Cloudinary...
              </p>
              <p className="text-[11px] text-neutral-400">
                Generating signed web-optimized transformations
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-500">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                Click to browse or drag & drop fashion photography
              </p>
              <p className="text-[11px] text-neutral-400">
                JPG, PNG, WEBP, or AVIF (Up to 10 MB per file)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Images Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {media.map((item, index) => {
            const isPrimary = item.role === "primary";
            const isHover = item.role === "hover";

            return (
              <div
                key={item.id || item.publicId || index}
                className={`border rounded-xl bg-white overflow-hidden shadow-xs transition-all ${
                  isPrimary
                    ? "ring-2 ring-rose-500 border-rose-300"
                    : isHover
                    ? "ring-2 ring-indigo-400 border-indigo-200"
                    : "border-neutral-200"
                }`}
              >
                {/* Image preview area */}
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden group">
                  <Image
                    src={item.url}
                    alt={item.alt || `Product image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />

                  {/* Role Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap z-10">
                    {isPrimary && (
                      <Badge className="bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                        <Star className="w-3 h-3 mr-1 fill-white" /> Primary
                      </Badge>
                    )}
                    {isHover && (
                      <Badge className="bg-indigo-600 text-white text-[10px] font-bold shadow-xs">
                        <Sparkles className="w-3 h-3 mr-1" /> Hover
                      </Badge>
                    )}
                    {!isPrimary && !isHover && (
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-xs text-[10px]">
                        Gallery #{index + 1}
                      </Badge>
                    )}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                      className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Controls & Alt Text */}
                <div className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant={isPrimary ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleSetPrimary(index)}
                        disabled={isPrimary}
                        className="text-[11px] h-7 px-2"
                      >
                        {isPrimary ? "Primary" : "Set Primary"}
                      </Button>
                      <Button
                        type="button"
                        variant={isHover ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleSetHover(index)}
                        disabled={isHover}
                        className="text-[11px] h-7 px-2"
                      >
                        {isHover ? "Hover" : "Set Hover"}
                      </Button>
                    </div>

                    {/* Order adjustment */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(index)}
                        disabled={index === 0}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Move left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRight(index)}
                        disabled={index === media.length - 1}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Move right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Alt text field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Accessibility Alt Text
                    </label>
                    <input
                      type="text"
                      value={item.alt || ""}
                      onChange={(e) => handleAltChange(index, e.target.value)}
                      placeholder="e.g. Front embroidered silhouette view"
                      className="w-full px-2.5 py-1 text-xs border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
