import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles } from "lucide-react";

interface CategoryStoryProps {
  categories: Category[];
  className?: string;
}

export function CategoryStory({ categories, className }: CategoryStoryProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section
      aria-label="Shop by Category"
      className={cn("w-full py-5 sm:py-6 bg-white border-b border-rose-200/80", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#881337]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#881337] font-serif">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-xs font-bold text-[#881337] transition-all uppercase tracking-wider shadow-xs"
          >
            <span>All Categories</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Story Circle Carousel (Native Horizontal scroll on mobile) */}
        <div className="flex items-start gap-3.5 sm:gap-5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group flex flex-col items-center shrink-0 focus:outline-none select-none active:scale-95 transition-transform"
            >
              {/* Circular Avatar with Luxury Rose & Maroon Border */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-rose-200 group-hover:border-[#881337] transition-colors p-[2px] bg-white shadow-xs">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-rose-50/40">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 64px, 80px"
                      className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-500">
                      {category.name[0]}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Label */}
              <span className="mt-1.5 text-[11px] sm:text-xs font-semibold text-neutral-800 font-sans group-hover:text-[#881337] max-w-[72px] sm:max-w-[84px] text-center truncate leading-tight transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
