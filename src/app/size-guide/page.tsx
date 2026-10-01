import React from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Garment Size Guide",
  path: "/size-guide",
});

const sizeData = [
  { size: "XS", bust: "32-33", waist: "26-27", hip: "35-36" },
  { size: "S", bust: "34-35", waist: "28-29", hip: "37-38" },
  { size: "M", bust: "36-37", waist: "30-31", hip: "39-40" },
  { size: "L", bust: "38-39", waist: "32-33", hip: "41-42" },
  { size: "XL", bust: "40-42", waist: "34-36", hip: "43-45" },
  { size: "XXL", bust: "43-45", waist: "37-39", hip: "46-48" },
];

export default function SizeGuidePage() {
  return (
    <div className="py-12 sm:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-editorial-subheading text-neutral-400">
            Precision Tailoring
          </span>
          <h1 className="text-3xl font-serif text-neutral-900 tracking-tight">
            Garment Size Guide
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto">
            All measurements are indicated in inches. For custom bespoke fits, reach out to our concierge.
          </p>
        </div>

        <div className="bg-white border border-neutral-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Standard Size</th>
                  <th className="py-3.5 px-4 font-semibold">Bust (in)</th>
                  <th className="py-3.5 px-4 font-semibold">Waist (in)</th>
                  <th className="py-3.5 px-4 font-semibold">Hip (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {sizeData.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-medium">{row.size}</td>
                    <td className="py-3 px-4">{row.bust}</td>
                    <td className="py-3 px-4">{row.waist}</td>
                    <td className="py-3 px-4">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
