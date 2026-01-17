"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { SUBMISSION_STATUSES } from "@/lib/types";

type Submission = {
  id: string;
  user_id: string;
  track_name: string;
  artists_display: string;
  cover_option: string;
  cover_link: string | null;
  cover_brief: string | null;
  cover_reference_link: string | null;
  cover_label_discretion: boolean;
  audio_link: string;
  spotify_link: string;
  tiktok_link: string | null;
  artist_email: string;
  artist_legal_name: string;
  artist_country: string;
  artist_city: string;
  artists_count: string;
  bulk_artist_list: string | null;
  status: string;
  admin_note: string | null;
  public_token: string;
  created_at: string;
  profiles?: { email: string; display_name: string } | null;
  artist_participants?: Array<{
    id: string;
    role: string;
    fullname: string;
    country: string;
    city: string;
    email: string;
    spotify: string;
  }>;
};

function statusVariant(status: string) {
  switch (status) {
    case "OK":
      return "success";
    case "NEEDS_FIX":
    case "DESIGN_REQUESTED":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

export function ApplicationsDashboard({ submissions }: { submissions: Submission[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(submissions[0]?.id ?? "");
  const [note, setNote] = useState(submissions[0]?.admin_note ?? "");
  const [status, setStatus] = useState(submissions[0]?.status ?? "NEW");
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return submissions.filter((submission) => {
      if (filter !== "All" && submission.status !== filter) return false;
      if (!query.trim()) return true;
      const term = query.toLowerCase();
      return (
        submission.track_name.toLowerCase().includes(term) ||
        submission.artists_display.toLowerCase().includes(term) ||
        submission.artist_email.toLowerCase().includes(term)
      );
    });
  }, [filter, query, submissions]);

  const selected = submissions.find((submission) => submission.id === selectedId);

  const syncSelection = (id: string) => {
    setSelectedId(id);
    const next = submissions.find((submission) => submission.id === id);
    setNote(next?.admin_note ?? "");
    setStatus(next?.status ?? "NEW");
  };

  const saveSubmission = async () => {
    if (!selected) return;
    const res = await fetch(`/api/admin/submissions/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note: note }),
    });
    if (!res.ok) {
      setMessage("Failed to update submission.");
      return;
    }
    setMessage("Submission updated.");
  };

  const moveToReleases = async () => {
    if (!selected) return;
    const res = await fetch("/api/admin/releases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: selected.id }),
    });
    if (!res.ok) {
      setMessage("Release already exists or failed to create.");
      return;
    }
    setMessage("Release created.");
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="font-serif text-3xl">Admin applications</h1>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">All statuses</option>
            {SUBMISSION_STATUSES.map((statusItem) => (
              <option key={statusItem} value={statusItem}>
                {statusItem}
              </option>
            ))}
          </Select>
          <Input
            className="max-w-sm"
            placeholder="Search by track, artist, or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              window.location.href = "/api/admin/export?type=submissions";
            }}
          >
            Export CSV
          </Button>
        </div>

        {filtered.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Artists</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((submission) => (
                <TableRow
                  key={submission.id}
                  className={submission.id === selectedId ? "bg-[var(--muted)]/60" : ""}
                  onClick={() => syncSelection(submission.id)}
                >
                  <TableCell>{submission.id}</TableCell>
                  <TableCell>{submission.track_name}</TableCell>
                  <TableCell>{submission.artists_display}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{submission.profiles?.email ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[var(--ink)]/70">No submissions match.</p>
        )}

        {selected && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3 rounded-2xl border border-[var(--ink)]/10 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/50">
                Submission details
              </p>
              <p className="text-lg font-semibold">{selected.track_name}</p>
              <p className="text-sm text-[var(--ink)]/70">{selected.artists_display}</p>
              <p className="text-sm">
                Account: {selected.profiles?.email ?? selected.user_id}
              </p>
              <p className="text-sm">Artist email: {selected.artist_email}</p>
              <p className="text-sm">
                Legal: {selected.artist_legal_name} ({selected.artist_country},{" "}
                {selected.artist_city})
              </p>
              <p className="text-sm">Cover option: {selected.cover_option}</p>
              {selected.cover_option === "LINK" ? (
                <p className="text-sm">Cover link: {selected.cover_link}</p>
              ) : (
                <>
                  <p className="text-sm">Design brief: {selected.cover_brief}</p>
                  <p className="text-sm">
                    Reference: {selected.cover_reference_link || "Label discretion"}
                  </p>
                </>
              )}
              <p className="text-sm">Audio link: {selected.audio_link}</p>
              <p className="text-sm">Spotify: {selected.spotify_link}</p>
              {selected.tiktok_link && <p className="text-sm">TikTok: {selected.tiktok_link}</p>}
              <p className="text-sm">Artists count: {selected.artists_count}</p>
              {selected.artist_participants?.length ? (
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Participants</p>
                  {selected.artist_participants.map((participant) => (
                    <p key={participant.id}>
                      {participant.fullname} — {participant.role} ({participant.country},{" "}
                      {participant.city})
                    </p>
                  ))}
                </div>
              ) : null}
              {selected.bulk_artist_list && (
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Bulk list</p>
                  <p>{selected.bulk_artist_list}</p>
                </div>
              )}
            </div>
            <div className="space-y-4 rounded-2xl border border-[var(--ink)]/10 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/50">
                Review
              </p>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                {SUBMISSION_STATUSES.map((statusItem) => (
                  <option key={statusItem} value={statusItem}>
                    {statusItem}
                  </option>
                ))}
              </Select>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Admin note"
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={saveSubmission}>Save submission</Button>
                {status === "OK" && (
                  <Button variant="secondary" onClick={moveToReleases}>
                    Move to Releases
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
