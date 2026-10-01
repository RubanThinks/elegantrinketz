import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 select-none transition-colors rounded-full",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white shadow-xs",
        secondary: "bg-amber-100 text-amber-900 border border-amber-200",
        outline: "border border-neutral-300 text-neutral-800 bg-white/90",
        accent: "bg-rose-50 text-rose-700 border border-rose-200 font-bold",
        sale: "bg-rose-600 text-white font-bold shadow-xs",
        outOfStock: "bg-neutral-200 text-neutral-700 border border-neutral-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
