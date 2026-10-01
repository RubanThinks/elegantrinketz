"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { adminNavigation } from "@/config/navigation";
import { ShieldCheck, LogOut, ExternalLink } from "lucide-react";
import { AdminGuard } from "@/components/guards/admin-guard";
import { useAuth } from "@/providers/auth-provider";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-neutral-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-sm font-serif tracking-wide text-white group"
          >
            <div className="relative w-7 h-7 rounded-full p-[1px] bg-gradient-to-tr from-[#D4AF37] via-[#F6E27A] to-[#B8860B] shadow-xs shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1px] flex items-center justify-center">
                <Image
                  src={siteConfig.logo}
                  alt=""
                  width={28}
                  height={28}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <span className="font-semibold text-white">
              {siteConfig.name}{" "}
              <span className="text-neutral-400 text-xs font-sans font-normal lowercase">
                / admin
              </span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          {user?.email && (
            <span className="text-neutral-500 hidden md:inline">{user.email}</span>
          )}
          <Link
            href="/"
            target="_blank"
            className="text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View Store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-56 shrink-0 bg-white border border-neutral-200 rounded-xl p-4 space-y-1 self-start">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold px-3 py-2">
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
                  className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-neutral-950 bg-neutral-100"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-neutral-900" : "text-neutral-500"
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
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
