import {
  Home,
  ShoppingBag,
  Grid3X3,
  Search,
  Heart,
  ShoppingCart,
  User,
  LayoutDashboard,
  Package,
  Boxes,
  FolderOpen,
  Layers,
  Users,
  ClipboardList,
  Settings,
  Sparkles,
  MessageSquare,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  STOREFRONT NAVIGATION                                              */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  icon?: typeof Home;
  children?: NavItem[];
  description?: string;
}

export const mainNavigation: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "Products",
    href: "/shop",
  },
  {
    label: "Collections",
    href: "/collections",
  },
];

export const mobileNavigation: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "Categories", href: "/categories", icon: Grid3X3 },
  { label: "Collections", href: "/collections", icon: Layers },
  { label: "Search", href: "/search", icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Bag", href: "/cart", icon: ShoppingCart },
  { label: "Account", href: "/account", icon: User },
];

/* ------------------------------------------------------------------ */
/*  FOOTER NAVIGATION                                                  */
/* ------------------------------------------------------------------ */

export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export const footerNavigation: FooterSection[] = [
  {
    title: "Shop & Discover",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Curated Collections", href: "/collections" },
      { label: "Boutique Categories", href: "/categories" },
      { label: "Search Catalog", href: "/search" },
      { label: "My Shopping Bag", href: "/cart" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Your Order", href: "/account/orders" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Size & Fit Guide", href: "/size-guide" },
      { label: "Contact & WhatsApp", href: "/contact" },
    ],
  },
  {
    title: "About Boutique",
    links: [
      { label: "Our Story & Craft", href: "/our-story" },
      { label: "About Us", href: "/about" },
      { label: "Salem Store", href: "/contact" },
      { label: "Quality Assurance", href: "/shipping" },
    ],
  },
  {
    title: "Consumer Policy",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "100% Secure Shopping", href: "/shipping" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  ADMIN NAVIGATION                                                   */
/* ------------------------------------------------------------------ */

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Storefront", href: "/admin/storefront", icon: Sparkles },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Collections", href: "/admin/collections", icon: Layers },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
