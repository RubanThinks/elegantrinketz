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
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop/collection/new-arrivals" },
      { label: "Best Sellers", href: "/shop/collection/best-sellers" },
    ],
  },
  {
    label: "Categories",
    href: "/categories",
    children: [
      { label: "Kids Wear", href: "/shop/kids-wear" },
      { label: "Women's Wear", href: "/shop/womens-wear" },
      { label: "Western Wear", href: "/shop/western-wear" },
      { label: "Ethnic Wear", href: "/shop/ethnic-wear" },
      { label: "Gowns / Frocks", href: "/shop/gowns-frocks" },
      { label: "Festive & Party Wear", href: "/shop/festive-party-wear" },
      { label: "Accessories (Trinketz)", href: "/shop/accessories-trinketz" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
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
      { label: "Kids Wear", href: "/shop/kids-wear" },
      { label: "Women's Wear", href: "/shop/womens-wear" },
      { label: "Western Wear", href: "/shop/western-wear" },
      { label: "Ethnic Wear", href: "/shop/ethnic-wear" },
      { label: "Gowns / Frocks", href: "/shop/gowns-frocks" },
      { label: "Festive & Party Wear", href: "/shop/festive-party-wear" },
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
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Collections", href: "/admin/collections", icon: Layers },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
