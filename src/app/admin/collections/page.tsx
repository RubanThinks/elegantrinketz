"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  UploadCloud,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAllCollectionsAdmin,
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/services/collections";
import { uploadToCloudinary } from "@/lib/cloudinary/client";
import { useAuth } from "@/providers/auth-provider";
import type { Collection } from "@/types";

export default function AdminCollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCollectionsAdmin();
      setCollections(data);
    } catch (err) {
      console.error("Error loading collections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const data = await getAllCollectionsAdmin();
        if (!ignore) {
          setCollections(data);
        }
      } catch (err) {
        console.error("Error loading collections:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setImagePublicId("");
    setSortOrder(collections.length + 1);
    setIsActive(true);
    setIsFeatured(false);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || "");
    setImageUrl(col.image || "");
    setImagePublicId(col.imagePublicId || "");
    setSortOrder(col.sortOrder || 1);
    setIsActive(col.isActive !== false);
    setIsFeatured(Boolean(col.isFeatured));
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const result = await uploadToCloudinary(
        file,
        "fashion-store/collections",
        "primary",
        0,
        `${name || "Collection"} banner`
      );
      setImageUrl(result.url);
      setImagePublicId(result.publicId);
    } catch (err) {
      setErrorMessage((err as Error).message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        image: imageUrl || undefined,
        imagePublicId: imagePublicId || undefined,
        sortOrder: Number(sortOrder) || 1,
        isActive,
        isFeatured,
      };

      if (editingCollection) {
        await updateCollection(editingCollection.id, payload, user?.uid);
        setSuccessMessage("Collection updated successfully.");
      } else {
        await createCollection(payload, user?.uid);
        setSuccessMessage("Collection created successfully.");
      }

      setIsModalOpen(false);
      await loadCollections();
    } catch (err) {
      setErrorMessage((err as Error).message || "Failed to save collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, colName: string) => {
    if (!confirm(`Are you sure you want to delete collection "${colName}"?`)) return;

    try {
      await deleteCollection(id, user?.uid);
      setSuccessMessage(`Collection "${colName}" deleted.`);
      await loadCollections();
    } catch (err) {
      alert((err as Error).message || "Failed to delete collection.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Curated Collections
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Curate thematic campaigns, seasonal capsules, and bridal edits.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          className="bg-rose-600 hover:bg-rose-700 text-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Collection
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Table */}
      <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            Loading collections...
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 text-[10px] uppercase font-bold text-neutral-500 tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Collection</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Featured</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                        {col.image ? (
                          <Image
                            src={col.image}
                            alt={col.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layers className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{col.name}</p>
                        {col.description && (
                          <p className="text-[11px] text-neutral-500 truncate max-w-xs">
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-neutral-600">/{col.slug}</td>

                  <td className="py-3 px-3">
                    {col.isFeatured ? (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] gap-1">
                        <Sparkles className="w-3 h-3 text-rose-500" /> Featured
                      </Badge>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {col.isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-neutral-400 text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(col)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Edit collection"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(col.id, col.name)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-base text-neutral-900">
                {editingCollection ? "Edit Collection" : "Create New Collection"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 uppercase tracking-wider block">
                  Collection Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCollection) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, "-")
                          .replace(/[^\w-]+/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Festive Edit"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 uppercase tracking-wider block">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. festive-edit"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 uppercase tracking-wider block">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 uppercase tracking-wider block">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Curated celebration ensembles rich with zari and embroidery"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 uppercase tracking-wider block">
                  Collection Banner (Cloudinary)
                </label>
                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <div className="w-14 h-14 rounded-xl border border-neutral-200 overflow-hidden relative shrink-0">
                      <Image
                        src={imageUrl}
                        alt={name || "Preview"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <label className="flex-1 border border-dashed border-neutral-300 rounded-xl p-3 text-center cursor-pointer hover:bg-neutral-50 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 text-rose-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-neutral-600">
                        <UploadCloud className="w-4 h-4 text-neutral-400" />
                        <span>{imageUrl ? "Replace Banner" : "Upload Banner Image"}</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-medium text-neutral-800">
                    Active & Visible
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-medium text-neutral-800">
                    Feature on Home
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="bg-rose-600"
                >
                  {editingCollection ? "Save Changes" : "Create Collection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
