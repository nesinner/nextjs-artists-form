import { stringify } from "csv-stringify/sync";
import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";

function buildCsv(rows: Record<string, unknown>[], columns: string[]) {
  return stringify(rows, { header: true, columns });
}

export async function GET(request: Request) {
  const profile = await requireAdminProfile();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const supabase = await createClient();

  if (type === "submissions") {
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
        *,
        artist_participants (*),
        profiles (email, display_name)
      `
      )
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const rows =
      data?.map((submission) => ({
        id: submission.id,
        account_id: submission.user_id,
        account_email: submission.profiles?.email ?? "",
        account_display_name: submission.profiles?.display_name ?? "",
        track_name: submission.track_name,
        artists_display: submission.artists_display,
        cover_option: submission.cover_option,
        cover_link: submission.cover_link,
        cover_file_path: submission.cover_file_path ?? "",
        cover_brief: submission.cover_brief ?? "",
        cover_reference_link: submission.cover_reference_link ?? "",
        cover_label_discretion: submission.cover_label_discretion,
        audio_link: submission.audio_link,
        audio_file_paths: submission.audio_file_paths ?? "",
        spotify_link: submission.spotify_link,
        tiktok_link: submission.tiktok_link ?? "",
        artist_email: submission.artist_email,
        artist_legal_name: submission.artist_legal_name,
        artist_country: submission.artist_country,
        artist_city: submission.artist_city,
        artists_count: submission.artists_count,
        bulk_artist_list: submission.bulk_artist_list ?? "",
        participants: JSON.stringify(submission.artist_participants ?? []),
        status: submission.status,
        admin_note: submission.admin_note ?? "",
        public_token: submission.public_token,
        created_at: submission.created_at,
        updated_at: submission.updated_at,
      })) ?? [];
    const columns = [
      "id",
      "account_id",
      "account_email",
      "account_display_name",
      "track_name",
      "artists_display",
      "cover_option",
      "cover_link",
      "cover_file_path",
      "cover_brief",
      "cover_reference_link",
      "cover_label_discretion",
      "audio_link",
      "audio_file_paths",
      "spotify_link",
      "tiktok_link",
      "artist_email",
      "artist_legal_name",
      "artist_country",
      "artist_city",
      "artists_count",
      "bulk_artist_list",
      "participants",
      "status",
      "admin_note",
      "public_token",
      "created_at",
      "updated_at",
    ];
    const csv = buildCsv(rows, columns);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=applications.csv",
      },
    });
  }

  if (type === "releases") {
    const { data, error } = await supabase
      .from("releases")
      .select(
        `
        *,
        submissions (track_name, artists_display, artist_email)
      `
      )
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const rows =
      data?.map((release) => {
        const submission = Array.isArray(release.submissions)
          ? release.submissions[0]
          : release.submissions;
        return {
        id: release.id,
        submission_id: release.submission_id,
        release_status: release.status,
        release_note: release.release_note ?? "",
        release_created_at: release.created_at,
        release_updated_at: release.updated_at,
        track_name: submission?.track_name ?? "",
        artists_display: submission?.artists_display ?? "",
        artist_email: submission?.artist_email ?? "",
      };
      }) ?? [];
    const columns = [
      "id",
      "submission_id",
      "release_status",
      "release_note",
      "release_created_at",
      "release_updated_at",
      "track_name",
      "artists_display",
      "artist_email",
    ];
    const csv = buildCsv(rows, columns);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=releases.csv",
      },
    });
  }

  if (type === "planned") {
    const { data, error } = await supabase
      .from("planned_catalog")
      .select(
        `
        *,
        releases (
          status,
          submissions (track_name, artists_display, artist_email)
        )
      `
      )
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const rows =
      data?.map((item) => {
        const release = Array.isArray(item.releases)
          ? item.releases[0]
          : item.releases;
        const submission = Array.isArray(release?.submissions)
          ? release?.submissions[0]
          : release?.submissions;
        return {
        id: item.id,
        release_id: item.release_id,
        planned_created_at: item.created_at,
        release_status: release?.status ?? "",
        track_name: submission?.track_name ?? "",
        artists_display: submission?.artists_display ?? "",
        artist_email: submission?.artist_email ?? "",
      };
      }) ?? [];
    const columns = [
      "id",
      "release_id",
      "planned_created_at",
      "release_status",
      "track_name",
      "artists_display",
      "artist_email",
    ];
    const csv = buildCsv(rows, columns);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=planned_catalog.csv",
      },
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
