import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#167c74] text-white shadow-xs",
        secondary:
          "border-transparent bg-[#edf7f4] text-[#167c74]",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: "border-[#cfe3dd] text-[#152321]",
        success: "border-transparent bg-[#e7f4ed] text-[#0d5c45]",
        warning: "border-transparent bg-[#fff2e8] text-[#a64524]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
