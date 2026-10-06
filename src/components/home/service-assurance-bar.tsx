import React from "react";
import { Truck, RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";

export function ServiceAssuranceBar() {
  const assurances = [
    {
      icon: Truck,
      title: "Fast Delivery",
      subtitle: "Free Delivery in Salem",
    },
    {
      icon: RotateCcw,
      title: "Easy Exchanges",
      subtitle: "7-Day Size Support",
    },
    {
      icon: ShieldCheck,
      title: "100% Quality",
      subtitle: "Inspected Fabric & Stitching",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Orders",
      subtitle: "Instant Sizing & Checkout",
    },
  ];

  return (
    <section
      aria-label="Service Guarantees"
      className="w-full bg-neutral-100 border-y border-neutral-200 py-3.5 sm:py-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {assurances.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-900 tracking-tight font-flipkart truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-medium truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
