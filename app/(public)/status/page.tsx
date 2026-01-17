import { Suspense } from "react";

import { StatusClient } from "@/components/status-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <h1 className="font-serif text-3xl">Artist status</h1>
          </CardHeader>
          <CardContent className="text-sm text-[var(--ink)]/60">
            Loading status checker...
          </CardContent>
        </Card>
      }
    >
      <StatusClient />
    </Suspense>
  );
}
