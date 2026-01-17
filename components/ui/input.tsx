import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-[var(--ink)]/20 bg-white/70 px-4 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--ink)]/50 focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--ink)]/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
