import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { generateToken } from "@/lib/tokens";
import { submissionSchema, participantSchema } from "@/lib/validators";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("submissions")
    .select("id, track_name, artists_display, status, updated_at, public_token")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const participants = Array.isArray(body.participants)
    ? body.participants
    : [];
  if (["2", "3", "4"].includes(parsed.data.artists_count)) {
    const validation = participantSchema.array().safeParse(participants);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = generateToken(12);
  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      track_name: parsed.data.track_name,
      artists_display: parsed.data.artists_display,
      cover_option: parsed.data.cover_option,
      cover_link: parsed.data.cover_link ?? null,
      cover_brief: parsed.data.cover_brief ?? null,
      cover_reference_link: parsed.data.cover_reference_link || null,
      cover_label_discretion: parsed.data.cover_label_discretion,
      audio_link: parsed.data.audio_link,
      spotify_link: parsed.data.spotify_link,
      tiktok_link: parsed.data.tiktok_link ?? null,
      artist_email: parsed.data.artist_email,
      artist_legal_name: parsed.data.artist_legal_name,
      artist_country: parsed.data.artist_country,
      artist_city: parsed.data.artist_city,
      artists_count: parsed.data.artists_count,
      bulk_artist_list: parsed.data.bulk_artist_list ?? null,
      status: "NEW",
      admin_note: null,
      public_token: token,
    })
    .select("id, public_token")
    .single();

  if (error || !submission) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create submission." },
      { status: 500 }
    );
  }

  if (participants.length) {
    const { error: participantError } = await supabase
      .from("artist_participants")
      .insert(
        participants.map((participant: Record<string, string>) => ({
          submission_id: submission.id,
          role: participant.role,
          fullname: participant.fullname,
          country: participant.country,
          city: participant.city,
          email: participant.email,
          spotify: participant.spotify,
        }))
      );
    if (participantError) {
      return NextResponse.json(
        { error: participantError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ data: submission });
}
