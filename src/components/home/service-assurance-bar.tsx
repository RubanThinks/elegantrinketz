import React from "react";
import { Truck, RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";

export function ServiceAssuranceBar() {
  const assurances = [
    {
      icon: Truck,
      title: "Fast Delivery",
      subtitle: "Free delivery across Salem",
    },
    {
      icon: RotateCcw,
      title: "Easy Exchanges",
      subtitle: "7-day size & fit support",
    },
    {
      icon: ShieldCheck,
      title: "100% Quality",
      subtitle: "Inspected fabric & stitching",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Orders",
      subtitle: "Instant sizing & checkout",
    },
  ];

  return (
    <section
      aria-label="Service Guarantees"
      className="w-full bg-neutral-100 border-y border-neutral-200 py-3 sm:py-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {assurances.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start sm:items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-xl border border-neutral-200/90 shadow-2xs"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-900 tracking-tight font-flipkart leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-medium leading-tight mt-0.5 break-words">
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
