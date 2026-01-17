import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <section className="flex flex-col justify-center gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--ink)]/50">
          Label Ops Console
        </p>
        <h1 className="font-serif text-5xl leading-tight text-[var(--ink)] md:text-6xl">
          Shape submissions into a release pipeline artists can trust.
        </h1>
        <p className="max-w-xl text-lg text-[var(--ink)]/70">
          Collect tracks, manage cover assets, and move approved releases into a
          planned catalog. Built for creators who need clarity, speed, and
          accountability.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className={buttonVariants({ size: "lg" })} href="/submit">
            Start a submission
          </Link>
          <Link
            className={buttonVariants({ size: "lg", variant: "secondary" })}
            href="/status"
          >
            Track a release
          </Link>
        </div>
      </section>
      <section className="grid gap-6">
        {[
          {
            title: "Artist Submit",
            body: "Capture full release details with conditional fields, draft autosave, and a token-based tracker.",
            link: "/submit",
          },
          {
            title: "Admin Applications",
            body: "Filter, review, and move OK submissions into Releases while keeping notes visible to artists.",
            link: "/admin/applications",
          },
          {
            title: "Release Planning",
            body: "Advance approved releases into the planned catalog and export CSVs on demand.",
            link: "/admin/planned",
          },
        ].map((card) => (
          <Card key={card.title} className="border-none">
            <CardHeader>
              <h2 className="text-xl font-semibold">{card.title}</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--ink)]/70">{card.body}</p>
              <Link
                href={card.link}
                className="text-sm font-semibold text-[var(--accent)]"
              >
                Open workspace →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
