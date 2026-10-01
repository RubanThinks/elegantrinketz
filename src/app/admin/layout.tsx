"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { adminNavigation } from "@/config/navigation";
import { LogOut, ExternalLink, Menu, X, ShieldCheck } from "lucide-react";
import { AdminGuard } from "@/components/guards/admin-guard";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 flex flex-col">
      {/* Admin Top Navigation — Clean White & Rose Theme */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Mobile Admin Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Toggle Admin Menu"
            className="md:hidden p-2 -ml-2 text-neutral-700 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-neutral-900 group"
          >
            <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-rose-500 to-pink-500 shadow-xs shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1px] flex items-center justify-center">
                <Image
                  src={siteConfig.logo}
                  alt=""
                  width={30}
                  height={30}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif italic font-bold text-neutral-900">
                {siteConfig.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {user?.email && (
            <span className="text-neutral-500 hidden sm:inline max-w-[180px] truncate">
              {user.email}
            </span>
          )}
          <Link
            href="/"
            target="_blank"
            className="text-neutral-600 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-neutral-100"
          >
            <span className="hidden xs:inline">Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="text-neutral-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-neutral-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Admin Horizontal Quick Tabs (Clean 1-line navigation) */}
      <div className="md:hidden bg-white border-b border-neutral-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
                isActive
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin Mobile Slide-over Drawer (Hamburger) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Admin Operations
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors",
                        isActive
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "text-neutral-700 hover:bg-neutral-100"
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn("w-4 h-4", isActive ? "text-rose-600" : "text-neutral-400")}
                        />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Body with Desktop-Only Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Desktop Sidebar Navigation (Hidden on mobile) */}
        <aside className="hidden md:block w-56 shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-4 space-y-1 self-start shadow-2xs">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold px-3 py-2">
            Operations
          </p>
          <nav className="space-y-0.5">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors",
                    isActive
                      ? "text-rose-700 bg-rose-50 border border-rose-100"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-rose-600" : "text-neutral-400"
                      )}
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Admin layout with AdminGuard.
 * The admin/login page has its own layout without the sidebar.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
