import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display, Roboto, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/providers/auth-provider";
import { WishlistProvider } from "@/providers/wishlist-provider";
import { CartProvider } from "@/providers/cart-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/common/whatsapp-floating-button";
import { BottomNav } from "@/components/navigation/bottom-nav";
import {
  JsonLd,
  getOrganizationSchema,
  getWebSiteSchema,
} from "@/lib/seo/structured-data";

/** Flipkart's primary font for product cards, titles, prices & filters */
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

/** Amazon's web-font equivalent (Amazon Ember UI & high-converting action buttons) */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: true,
  },
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.description,
  keywords: [
    "Elegant Trinketz",
    "Elegance in Every Dress",
    "Side Cut Kurtis",
    "Umbrella Kurtis",
    "3 Piece Sets",
    "Straight Pants",
    "Shimmer Leggings",
    "Kurtis",
    "Festive & Party Wear",
    "Accessories",
    "Trinketz",
    "Salem fashion",
    "Jagir Ammapalayam fashion",
    "women's clothing online",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  icons: {
    icon: siteConfig.favicon,
    apple: siteConfig.favicon,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.seo.openGraph.locale,
    url: siteConfig.url,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.description,
    siteName: siteConfig.seo.openGraph.siteName,
    images: [
      {
        url: siteConfig.logo,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.logo],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html
      lang="en"
      className={`${roboto.variable} ${inter.variable} ${poppins.variable} ${playfair.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <JsonLd schema={orgSchema} />
        <JsonLd schema={websiteSchema} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <AnnouncementBar />
              <Header />
              <main className="flex-1 flex flex-col pb-16 lg:pb-0">{children}</main>
              <Footer />
              <BottomNav />
              <WhatsAppFloatingButton />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
