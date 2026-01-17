import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

export default async function MySubmissionsPage() {
  const profile = await requireUser();
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, track_name, artists_display, status, updated_at, public_token")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <Card>
      <CardHeader>
        <h1 className="font-serif text-3xl">My submissions</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        {!submissions?.length && (
          <p className="text-sm text-[var(--ink)]/60">
            No submissions yet. <Link className="font-semibold text-[var(--accent)]" href="/submit">Create one</Link>.
          </p>
        )}
        {submissions?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead>Artists</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Token</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.track_name}</TableCell>
                  <TableCell>{submission.artists_display}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(submission.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link
                      className="text-sm font-semibold text-[var(--accent)]"
                      href={`/status?token=${submission.public_token}`}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}
