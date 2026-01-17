"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type StatusResult = {
  id: string;
  track_name: string;
  artists_display: string;
  status: string;
  admin_note: string | null;
  public_token: string;
  releases: {
    id: string;
    status: string;
    release_note: string | null;
  } | null;
};

function statusVariant(status: string) {
  switch (status) {
    case "OK":
      return "success";
    case "APPROVED":
      return "success";
    case "SCHEDULED":
      return "info";
    case "NEEDS_FIX":
    case "DESIGN_REQUESTED":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

export default function StatusPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async (tokenValue: string) => {
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/status?token=${tokenValue}`);
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error ?? "Unable to fetch status.");
      setResult(null);
      setLoading(false);
      return;
    }
    setResult(payload.data);
    setLoading(false);
  };

  useEffect(() => {
    const initial = searchParams.get("token");
    if (initial) {
      fetchStatus(initial);
    }
  }, [searchParams]);

  return (
    <Card>
      <CardHeader>
        <h1 className="font-serif text-3xl">Artist status</h1>
        <p className="text-sm text-[var(--ink)]/70">
          Enter your submission token to view status updates.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="max-w-sm"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Enter token"
          />
          <Button onClick={() => fetchStatus(token)} disabled={loading || !token}>
            {loading ? "Checking..." : "Check status"}
          </Button>
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {result && (
          <div className="rounded-2xl border border-[var(--ink)]/10 bg-white/70 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">{result.track_name}</h2>
              <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
            </div>
            <p className="text-sm text-[var(--ink)]/70">{result.artists_display}</p>
            {result.admin_note && (
              <p className="mt-3 rounded-xl bg-[var(--muted)] px-4 py-3 text-sm">
                {result.admin_note}
              </p>
            )}
            {result.releases && (
              <div className="mt-4 rounded-2xl border border-[var(--ink)]/10 bg-[var(--bg-strong)]/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/50">
                  Release
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={statusVariant(result.releases.status)}>
                    {result.releases.status}
                  </Badge>
                  {result.releases.release_note && (
                    <span className="text-sm text-[var(--ink)]/70">
                      {result.releases.release_note}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
