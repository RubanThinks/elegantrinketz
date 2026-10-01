import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
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
    "Kids Wear",
    "Women's Wear",
    "Western Wear",
    "Ethnic Wear",
    "Gowns",
    "Frocks",
    "Festive & Party Wear",
    "Accessories",
    "Trinketz",
    "Chennai fashion",
    "Anna Nagar fashion",
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
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.description,
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
      className={`${poppins.variable} ${playfair.variable} h-full antialiased`}
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
