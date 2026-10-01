import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/services/categories";
import { getCollections } from "@/services/collections";
import { getProducts } from "@/services/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic category routes: /shop/[category] (active categories only)
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/shop/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    categoryRoutes = [];
  }

  // Dynamic collection routes: /shop/collection/[slug] (active collections only)
  let collectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const collections = await getCollections();
    collectionRoutes = collections.map((col) => ({
      url: `${baseUrl}/shop/collection/${col.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    collectionRoutes = [];
  }

  // Dynamic product routes: /products/[slug] (published products only)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { products } = await getProducts({ limit: 200 });
    productRoutes = products.map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch {
    productRoutes = [];
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...productRoutes,
  ];
}
