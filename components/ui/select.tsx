import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-[var(--ink)]/20 bg-white/70 px-4 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--ink)]/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
