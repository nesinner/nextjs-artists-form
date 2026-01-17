import { describe, expect, it } from "vitest";

import { submissionSchema } from "@/lib/validators";

const basePayload = {
  track_name: "Track",
  artists_display: "Artist",
  cover_option: "LINK",
  cover_link: "https://example.com/cover.jpg",
  cover_brief: null,
  cover_reference_link: null,
  cover_label_discretion: false,
  audio_link: "https://example.com/audio",
  spotify_link: "https://open.spotify.com/track/123",
  tiktok_link: null,
  artist_email: "artist@example.com",
  artist_legal_name: "Artist Legal",
  artist_country: "US",
  artist_city: "LA",
  artists_count: "1",
  bulk_artist_list: null,
};

describe("submissionSchema", () => {
  it("accepts LINK cover option with cover_link", () => {
    const result = submissionSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("rejects missing cover_link for LINK option", () => {
    const result = submissionSchema.safeParse({
      ...basePayload,
      cover_link: null,
    });
    expect(result.success).toBe(false);
  });

  it("requires brief or discretion for LABEL_DESIGN", () => {
    const result = submissionSchema.safeParse({
      ...basePayload,
      cover_option: "LABEL_DESIGN",
      cover_link: null,
      cover_brief: "",
      cover_reference_link: "",
      cover_label_discretion: false,
    });
    expect(result.success).toBe(false);
  });

  it("requires bulk list for 5+ artists", () => {
    const result = submissionSchema.safeParse({
      ...basePayload,
      artists_count: "5+",
      bulk_artist_list: null,
    });
    expect(result.success).toBe(false);
  });
});
