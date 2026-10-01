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
      className={cn("w-full py-6 sm:py-8 bg-white border-b border-rose-100/70", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Story Circle Carousel (Native Horizontal scroll on mobile) */}
        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group flex flex-col items-center shrink-0 focus:outline-none rounded-full select-none active:scale-95 transition-transform"
            >
              {/* Circular Avatar with Pink-Rose Gradient Ring (Myntra/Purplle Story ring) */}
              <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-[2px] bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-300 shadow-xs group-hover:shadow-md transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-rose-50">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 72px, 88px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-rose-400">
                        {category.name[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Label */}
              <span className="mt-2 text-[11px] sm:text-xs font-medium text-neutral-700 group-hover:text-rose-600 max-w-[76px] sm:max-w-[90px] text-center truncate leading-tight transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
