"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Eye,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  DollarSign,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaManager } from "@/components/admin/media-manager";
import { SizeInventoryEditor } from "@/components/admin/size-inventory-editor";
import {
  createProduct,
  updateProduct,
  slugify,
} from "@/services/products";
import { getCategories } from "@/services/categories";
import { getCollections } from "@/services/collections";
import { useAuth } from "@/providers/auth-provider";
import type {
  Product,
  Category,
  Collection,
  ProductSize,
  ProductMediaItem,
  ProductStatus,
} from "@/types";

interface ProductFormProps {
  initialProduct?: Product | null;
  isEditing?: boolean;
}

export function ProductForm({
  initialProduct,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [name, setName] = useState(initialProduct?.name || "");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.shortDescription || ""
  );

  // Pricing
  const [price, setPrice] = useState<string>(
    initialProduct ? String(initialProduct.price) : ""
  );
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initialProduct?.compareAtPrice ? String(initialProduct.compareAtPrice) : ""
  );

  // Classification
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || "");
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initialProduct?.collectionIds || []
  );
  const [tagsInput, setTagsInput] = useState(
    initialProduct?.tags ? initialProduct.tags.join(", ") : ""
  );

  // Media
  const [media, setMedia] = useState<ProductMediaItem[]>(() => {
    if (initialProduct?.media && initialProduct.media.length > 0) {
      return initialProduct.media;
    }
    // Reconstruct from legacy images if needed
    const list: ProductMediaItem[] = [];
    if (initialProduct?.images?.primary) {
      list.push({
        id: "img-primary",
        url: initialProduct.images.primary,
        publicId: "",
        width: 800,
        height: 1067,
        alt: `${initialProduct.name} primary`,
        role: "primary",
        sortOrder: 0,
      });
    }
    if (initialProduct?.images?.hover) {
      list.push({
        id: "img-hover",
        url: initialProduct.images.hover,
        publicId: "",
        width: 800,
        height: 1067,
        alt: `${initialProduct.name} hover`,
        role: "hover",
        sortOrder: 1,
      });
    }
    if (initialProduct?.images?.gallery) {
      initialProduct.images.gallery.forEach((url, i) => {
        list.push({
          id: `img-gallery-${i}`,
          url,
          publicId: "",
          width: 800,
          height: 1067,
          alt: `${initialProduct.name} gallery ${i + 1}`,
          role: "gallery",
          sortOrder: i + 2,
        });
      });
    }
    return list;
  });

  // Variants & Inventory
  const [sizes, setSizes] = useState<ProductSize[]>(
    initialProduct?.sizes && initialProduct.sizes.length > 0
      ? initialProduct.sizes
      : [
          { id: "S", name: "S", stock: 5, isAvailable: true },
          { id: "M", name: "M", stock: 5, isAvailable: true },
          { id: "L", name: "L", stock: 5, isAvailable: true },
          { id: "XL", name: "XL", stock: 2, isAvailable: true },
        ]
  );

  // Flags & Status
  const [isNew, setIsNew] = useState(initialProduct ? initialProduct.isNew : true);
  const [isBestSeller, setIsBestSeller] = useState(
    initialProduct ? initialProduct.isBestSeller : false
  );
  const [isFeatured, setIsFeatured] = useState(
    initialProduct ? initialProduct.isFeatured : false
  );
  const [status, setStatus] = useState<ProductStatus>(
    initialProduct?.status || "draft"
  );

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initialProduct?.seoDescription || ""
  );

  // Categories & Collections data
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-slug generation from name if not manually modified
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialProduct?.slug));

  useEffect(() => {
    async function loadTaxonomy() {
      const [cats, cols] = await Promise.all([
        getCategories(),
        getCollections(),
      ]);
      setCategories(cats);
      setCollections(cols);
      if (!categoryId && cats.length > 0 && !isEditing) {
        setCategoryId(cats[0].id);
      }
    }
    loadTaxonomy();
  }, [categoryId, isEditing]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugCustomized) {
      setSlug(slugify(val));
    }
  };

  const handleCollectionToggle = (colId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  // Submit Handler
  const handleSave = async (targetStatus: ProductStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic Validation
    if (!name.trim()) {
      setErrorMessage("Please provide a product title.");
      return;
    }
    if (!sku.trim()) {
      setErrorMessage("A valid unique SKU is required.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage("Please enter a valid price greater than zero.");
      return;
    }

    if (targetStatus === "published" && media.length === 0) {
      setErrorMessage("At least one primary product image is required to publish.");
      return;
    }

    setIsSubmitting(true);
    setStatus(targetStatus);

    try {
      // Find category slug and name for denormalized search
      const selectedCat = categories.find((c) => c.id === categoryId);

      // Normalize images
      const primaryItem = media.find((m) => m.role === "primary") || media[0];
      const hoverItem = media.find((m) => m.role === "hover");
      const galleryItems = media.filter((m) => m.role === "gallery");

      const imagesPayload = {
        primary: primaryItem ? primaryItem.url : "",
        hover: hoverItem ? hoverItem.url : null,
        gallery: galleryItems.map((g) => g.url),
        mediaItems: media,
      };

      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const productPayload = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        slug: slug.trim().toLowerCase() || slugify(name),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        price: numPrice,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId,
        categorySlug: selectedCat?.slug || "",
        categoryName: selectedCat?.name || "",
        collectionIds: selectedCollections,
        images: imagesPayload,
        media,
        sizes,
        tags: parsedTags,
        status: targetStatus,
        isPublished: targetStatus === "published",
        isNew,
        isBestSeller,
        isFeatured,
        seoTitle: seoTitle.trim() || name.trim(),
        seoDescription: seoDescription.trim() || shortDescription.trim() || description.slice(0, 150),
      };

      if (isEditing && initialProduct?.id) {
        await updateProduct(initialProduct.id, productPayload, user?.uid);
        setSuccessMessage("Product saved successfully!");
        router.refresh();
      } else {
        await createProduct(productPayload, user?.uid);
        setSuccessMessage("Product created successfully!");
        router.push("/admin/products");
      }
    } catch (err) {
      setErrorMessage((err as Error).message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 border border-neutral-200 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              {isEditing ? `Edit: ${initialProduct?.name}` : "Create New Product"}
            </h1>
            <p className="text-xs text-neutral-500">
              {isEditing
                ? `ID: ${initialProduct?.id} · SKU: ${initialProduct?.sku}`
                : "Add fashion creation with Cloudinary assets and size inventory"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && initialProduct?.slug && (
            <Link
              href={`/products/${initialProduct.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-xs font-semibold rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => handleSave("draft")}
            isLoading={isSubmitting && status === "draft"}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleSave("published")}
            isLoading={isSubmitting && status === "published"}
            disabled={isSubmitting}
            className="text-xs font-semibold bg-rose-600 hover:bg-rose-700"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isEditing ? "Update & Publish" : "Publish Product"}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Information */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
              Product Information
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Rose Pink Embroidered Anarkali"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                    SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
                      const words = cleaned ? cleaned.split(/\s+/).slice(0, 3) : [];
                      const initials = words.length > 0
                        ? words.map((w) => w.slice(0, 3).toUpperCase()).join("-")
                        : "ITEM";
                      const randomSuffix = Math.floor(100 + Math.random() * 900);
                      setSku(`ET-${initials}-${randomSuffix}`);
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Auto-generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. ET-RING-001"
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugCustomized(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="e.g. rose-pink-embroidered-anarkali"
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-600 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Short Highlight Summary
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Single sentence luxury highlight for quick preview"
                className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Detailed Product Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include fabric details, craftsmanship, silhouette, lining, care instructions..."
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>
          </div>

          {/* Card: Media Manager */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <MediaManager
              media={media}
              onChange={setMedia}
              productName={name || "Product"}
              productId={initialProduct?.id || slug || "draft"}
            />
          </div>

          {/* Card: Variants & Inventory */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <SizeInventoryEditor sizes={sizes} onChange={setSizes} />
          </div>

          {/* Card: SEO Meta */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
              Search Engine Optimization (SEO)
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                SEO Title Tag
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={name || "Product Name | Atelier Couture"}
                className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Concise, captivating meta description for Google search previews"
                className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column (1 span) */}
        <div className="space-y-6">
          {/* Card: Pricing */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-neutral-500" /> Pricing
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499"
                className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Compare-at MRP Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="3999"
                className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
              <p className="text-[11px] text-neutral-400">
                Shows strikethrough price when higher than selling price.
              </p>
            </div>
          </div>

          {/* Card: Classification & Taxonomy */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-neutral-500" /> Classification
            </h2>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Primary Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 bg-white focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Collections Multi-Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Collections & Edits
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto border border-neutral-200 rounded-xl p-2 bg-neutral-50/50">
                {collections.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer hover:text-neutral-950"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(col.id)}
                      onChange={() => handleCollectionToggle(col.id)}
                      className="rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{col.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="silk, festive, wedding, handloom"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>
          </div>

          {/* Card: Marketing & Feature Flags */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-2xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-neutral-500" /> Merchandising Flags
            </h2>

            <label className="flex items-center justify-between text-xs text-neutral-800 cursor-pointer py-1">
              <span>Mark as New Arrival</span>
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-neutral-800 cursor-pointer py-1 border-t border-neutral-100">
              <span>Mark as Best Seller</span>
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-neutral-800 cursor-pointer py-1 border-t border-neutral-100">
              <span>Feature on Homepage</span>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
