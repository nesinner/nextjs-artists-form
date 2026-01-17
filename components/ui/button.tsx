import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-[var(--bg)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--ink-strong)] focus-visible:ring-[var(--ink)]",
        secondary:
          "border border-[var(--ink)]/30 bg-transparent text-[var(--ink)] hover:border-[var(--ink)] focus-visible:ring-[var(--ink)]",
        ghost:
          "bg-transparent text-[var(--ink)] hover:bg-[var(--muted)] focus-visible:ring-[var(--ink)]",
        danger:
          "bg-[var(--danger)] text-white hover:bg-[var(--danger-strong)] focus-visible:ring-[var(--danger)]",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
