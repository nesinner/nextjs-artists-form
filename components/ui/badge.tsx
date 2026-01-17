import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-[var(--muted)] text-[var(--ink)]",
        success: "bg-[var(--success)]/15 text-[var(--success)]",
        warning: "bg-[var(--warning)]/20 text-[var(--warning)]",
        danger: "bg-[var(--danger)]/15 text-[var(--danger)]",
        info: "bg-[var(--accent)]/15 text-[var(--accent)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
