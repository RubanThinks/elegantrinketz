import { permanentRedirect } from "next/navigation";

interface CategoryRedirectProps {
  params: Promise<{ slug: string }>;
}

/**
 * Backwards compatibility route:
 * Redirects legacy /categories/[slug] to standardized /shop/[category]
 */
export default async function LegacyCategoryRedirect({ params }: CategoryRedirectProps) {
  const { slug } = await params;
  permanentRedirect(`/shop/${slug}`);
}
