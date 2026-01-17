"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PlannedItem = {
  id: string;
  release_id: string;
  created_at: string;
  releases?: {
    status: string;
    submissions?: { track_name: string; artists_display: string; artist_email: string } | null;
  } | null;
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

export function PlannedDashboard({ planned }: { planned: PlannedItem[] }) {
  return (
    <Card>
      <CardHeader>
        <h1 className="font-serif text-3xl">Planned catalog</h1>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = "/api/admin/export?type=planned";
          }}
        >
          Export CSV
        </Button>
        {planned.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Release</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Artists</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planned.map((item) => {
                const release = Array.isArray(item.releases)
                  ? item.releases[0]
                  : item.releases;
                const submission = Array.isArray(release?.submissions)
                  ? release?.submissions[0]
                  : release?.submissions;
                return (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.release_id}</TableCell>
                  <TableCell>{submission?.track_name ?? "—"}</TableCell>
                  <TableCell>{submission?.artists_display ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(release?.status ?? "IN_PREP")}>
                      {release?.status ?? "IN_PREP"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[var(--ink)]/70">No planned entries yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
