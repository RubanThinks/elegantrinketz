import { permanentRedirect } from "next/navigation";

interface CollectionRedirectProps {
  params: Promise<{ slug: string }>;
}

/**
 * Backwards compatibility route:
 * Redirects legacy /collections/[slug] to standardized /shop/collection/[slug]
 */
export default async function LegacyCollectionRedirect({ params }: CollectionRedirectProps) {
  const { slug } = await params;
  permanentRedirect(`/shop/collection/${slug}`);
}
