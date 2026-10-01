"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/providers/auth-provider";

function AccountContent() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const sections = [
    {
      icon: Package,
      title: "Orders & Inquiries",
      description: "Track the status of your outfits and deliveries.",
      href: "/account/orders",
      ready: true,
    },
    {
      icon: MapPin,
      title: "Saved Addresses",
      description: "Manage your residential and shipping addresses.",
      href: "/account/addresses",
      ready: false,
    },
    {
      icon: Heart,
      title: "Wishlist",
      description: "View your saved styles and curated pieces.",
      href: "/wishlist",
      ready: true,
    },
  ];

  return (
    <div className="py-12 sm:py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-10 flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center shrink-0 border border-rose-200/50">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt={profile?.displayName || "Profile"}
                width={64}
                height={64}
                unoptimized
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-rose-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">
              {profile?.displayName || "Welcome"}
            </h1>
            <div className="mt-1 space-y-0.5">
              {user?.email && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
                </p>
              )}
              {profile?.phone && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{profile.phone}</span>
                </p>
              )}
              {profile?.createdAt && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Member since{" "}
                    {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Sign Out */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-neutral-500 hover:text-red-600 shrink-0 gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Sign Out</span>
          </Button>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                href={section.ready ? section.href : "#"}
                className={`group border border-neutral-200/80 rounded-2xl p-5 bg-white space-y-2.5 transition-all duration-200 ${
                  section.ready
                    ? "hover:border-rose-200 hover:shadow-sm cursor-pointer"
                    : "opacity-60 cursor-default"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-neutral-700" />
                  {section.ready ? (
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-rose-500 transition-colors" />
                  ) : (
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-neutral-900">
                  {section.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {section.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard redirectTo="/login">
      <AccountContent />
    </AuthGuard>
  );
}
