"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { RELEASE_STATUSES } from "@/lib/types";

type Release = {
  id: string;
  submission_id: string;
  status: string;
  release_note: string | null;
  created_at: string;
  submissions?: { track_name: string; artists_display: string; artist_email: string } | null;
};

function statusVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "success";
    case "SCHEDULED":
      return "info";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

export function ReleasesDashboard({ releases }: { releases: Release[] }) {
  const [selectedId, setSelectedId] = useState(releases[0]?.id ?? "");
  const selected = releases.find((release) => release.id === selectedId);
  const [status, setStatus] = useState(selected?.status ?? "IN_PREP");
  const [note, setNote] = useState(selected?.release_note ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const syncSelection = (id: string) => {
    setSelectedId(id);
    const next = releases.find((release) => release.id === id);
    setStatus(next?.status ?? "IN_PREP");
    setNote(next?.release_note ?? "");
  };

  const saveRelease = async () => {
    if (!selected) return;
    const res = await fetch(`/api/admin/releases/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, release_note: note }),
    });
    if (!res.ok) {
      setMessage("Failed to update release.");
      return;
    }
    setMessage("Release updated.");
  };

  const moveToPlanned = async () => {
    if (!selected) return;
    const res = await fetch("/api/admin/planned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ release_id: selected.id }),
    });
    if (!res.ok) {
      setMessage("Planned entry already exists or failed to create.");
      return;
    }
    setMessage("Planned catalog entry created.");
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="font-serif text-3xl">Releases</h1>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = "/api/admin/export?type=releases";
          }}
        >
          Export CSV
        </Button>

        {releases.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Artists</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => {
                const submission = Array.isArray(release.submissions)
                  ? release.submissions[0]
                  : release.submissions;
                return (
                <TableRow
                  key={release.id}
                  className={release.id === selectedId ? "bg-[var(--muted)]/60" : ""}
                  onClick={() => syncSelection(release.id)}
                >
                  <TableCell>{release.id}</TableCell>
                  <TableCell>{submission?.track_name ?? "—"}</TableCell>
                  <TableCell>{submission?.artists_display ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(release.status)}>{release.status}</Badge>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[var(--ink)]/70">No releases yet.</p>
        )}

        {selected && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-2 rounded-2xl border border-[var(--ink)]/10 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/50">
                Release details
              </p>
              <p className="text-lg font-semibold">
                {Array.isArray(selected.submissions)
                  ? selected.submissions[0]?.track_name ?? "Track"
                  : selected.submissions?.track_name ?? "Track"}
              </p>
              <p className="text-sm text-[var(--ink)]/70">
                {Array.isArray(selected.submissions)
                  ? selected.submissions[0]?.artists_display ?? "Artists"
                  : selected.submissions?.artists_display ?? "Artists"}
              </p>
              <p className="text-sm">Submission ID: {selected.submission_id}</p>
              <p className="text-sm">
                Artist email:{" "}
                {Array.isArray(selected.submissions)
                  ? selected.submissions[0]?.artist_email ?? "—"
                  : selected.submissions?.artist_email ?? "—"}
              </p>
            </div>
            <div className="space-y-4 rounded-2xl border border-[var(--ink)]/10 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/50">
                Release status
              </p>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                {RELEASE_STATUSES.map((statusItem) => (
                  <option key={statusItem} value={statusItem}>
                    {statusItem}
                  </option>
                ))}
              </Select>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Release note"
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={saveRelease}>Save release</Button>
                {status === "APPROVED" && (
                  <Button variant="secondary" onClick={moveToPlanned}>
                    Move to Planned Catalog
                  </Button>
                )}
              </div>
              {message && <p className="text-sm text-[var(--ink)]/70">{message}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
