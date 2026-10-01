"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/services/products";
import type { Product } from "@/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const prod = await getProductById(id);
        if (!prod) {
          setError(`Product with ID "${id}" was not found.`);
        } else {
          setProduct(prod);
        }
      } catch (err) {
        setError((err as Error).message || "Failed to load product.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-neutral-400" />
        <p className="text-xs text-neutral-500">Loading product editor...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-base font-bold text-neutral-900">Product Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          {error || "The requested product does not exist or may have been deleted."}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/products")}>
          Return to Products
        </Button>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEditing={true} />;
}
