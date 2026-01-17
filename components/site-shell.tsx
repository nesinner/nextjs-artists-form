import * as React from "react";

import { cn } from "@/lib/utils";

type SiteShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function SiteShell({ children, className }: SiteShellProps) {
  return (
    <div className={cn("relative min-h-screen px-6 pb-16 pt-6", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-[var(--bg-strong)] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--accent)]/10 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
