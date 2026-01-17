import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getSessionProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";

export async function SiteHeader({ className }: { className?: string }) {
  const profile = await getSessionProfile();

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--ink)]/10 bg-white/70 px-6 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-semibold text-[var(--ink)]">
          <span className="font-serif text-2xl">Artist Flow</span>
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/40">
          Submissions Portal
        </span>
      </div>
      <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--ink)]/70">
        <Link className="hover:text-[var(--ink)]" href="/submit">
          Submit
        </Link>
        <Link className="hover:text-[var(--ink)]" href="/submissions">
          My Submissions
        </Link>
        <Link className="hover:text-[var(--ink)]" href="/status">
          Status
        </Link>
        {profile?.is_admin && (
          <Link className="hover:text-[var(--ink)]" href="/admin/applications">
            Admin
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        {profile ? (
          <>
            <span className="text-[var(--ink)]/70">
              {profile.display_name || profile.email}
            </span>
            <form action={signOut}>
              <button className="rounded-full border border-[var(--ink)]/30 px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:border-[var(--ink)]">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--bg)]"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
