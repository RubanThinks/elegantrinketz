import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface CategoryStoryProps {
  categories: Category[];
  className?: string;
}

export function CategoryStory({ categories, className }: CategoryStoryProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section
      aria-label="Shop by Category"
      className={cn("w-full py-8 sm:py-10 bg-white border-b border-[#e8e0d8]", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37]">
                Shop by Category
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1a1a] tracking-tight mt-1">
              Explore Collections
            </h2>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center text-xs font-semibold text-[#1a1a1a] hover:text-[#D4AF37] transition-colors"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Story Circle Carousel (Horizontal scroll on mobile, flex on desktop) */}
        <div className="flex items-center gap-4 sm:gap-7 overflow-x-auto pb-3 pt-2 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group flex flex-col items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-full"
            >
              {/* Circular Avatar with gold ring on hover */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full p-[2.5px] bg-gradient-to-tr from-[#e8e0d8] via-[#e8e0d8] to-[#d4c5b9] group-hover:from-[#D4AF37] group-hover:to-[#E6C76A] transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:scale-105">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[#f8f4f0]">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 104px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-115"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#b8a99c]">
                        {category.name[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Label with subtle lift on hover */}
              <span className="mt-2.5 text-xs sm:text-sm font-medium text-[#1a1a1a] group-hover:text-[#D4AF37] tracking-normal text-center transition-all duration-200 group-hover:-translate-y-0.5">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
