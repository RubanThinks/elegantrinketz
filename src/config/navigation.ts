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
    label: "Kurtis",
    href: "/shop?category=kurtis",
    children: [
      { label: "All Kurtis", href: "/shop" },
      { label: "Side Cut Kurtis", href: "/shop/side-cut-kurtis" },
      { label: "Umbrella Kurtis", href: "/shop/umbrella-kurtis" },
    ],
  },
  {
    label: "3-Piece Sets",
    href: "/shop/three-piece-sets",
  },
  {
    label: "Bottomwear",
    href: "/shop?category=bottomwear",
    children: [
      { label: "Straight Pants", href: "/shop/straight-pants" },
      { label: "Shimmer Leggings", href: "/shop/shimmer-leggings" },
    ],
  },
  {
    label: "New Arrivals",
    href: "/shop/collection/new-arrivals",
  },
  {
    label: "Best Sellers",
    href: "/shop/collection/best-sellers",
  },
  {
    label: "Deals & Offers",
    href: "/shop?sort=price_asc",
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
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop/collection/new-arrivals" },
      { label: "Best Sellers", href: "/shop/collection/best-sellers" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Side Cut Kurtis", href: "/shop/side-cut-kurtis" },
      { label: "Umbrella Kurtis", href: "/shop/umbrella-kurtis" },
      { label: "3 Piece Sets", href: "/shop/three-piece-sets" },
      { label: "Straight Pants", href: "/shop/straight-pants" },
      { label: "Shimmer Leggings", href: "/shop/shimmer-leggings" },
      { label: "Ethnic & Festive Wear", href: "/shop/ethnic-wear" },
      { label: "Accessories (Trinketz)", href: "/shop/accessories-trinketz" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
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
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
