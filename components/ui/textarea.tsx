import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-2xl border border-[var(--ink)]/20 bg-white/70 px-4 py-3 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--ink)]/50 focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--ink)]/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
