import { z } from "zod";

import { RELEASE_STATUSES, SUBMISSION_STATUSES } from "@/lib/types";

export const participantSchema = z.object({
  role: z.string().min(1, "Role is required."),
  fullname: z.string().min(1, "Full name is required."),
  country: z.string().min(1, "Country is required."),
  city: z.string().min(1, "City is required."),
  email: z.string().email("Participant email is invalid."),
  spotify: z.string().url("Spotify link must be a valid URL."),
});

export const submissionSchema = z
  .object({
    track_name: z.string().min(1, "Track name is required."),
    artists_display: z.string().min(1, "Artists display is required."),
    cover_option: z.enum(["LINK", "LABEL_DESIGN"]),
    cover_link: z
      .string()
      .url("Cover link must be a valid URL.")
      .optional()
      .nullable(),
    cover_brief: z.string().optional().nullable(),
    cover_reference_link: z
      .string()
      .url("Reference link must be a valid URL.")
      .optional()
      .nullable()
      .or(z.literal("")),
    cover_label_discretion: z.boolean(),
    audio_link: z.string().url("Audio link must be a valid URL."),
    spotify_link: z.string().url("Spotify link must be a valid URL."),
    tiktok_link: z
      .string()
      .url("TikTok link must be a valid URL.")
      .optional()
      .nullable()
      .or(z.literal("")),
    artist_email: z.string().email("Artist email is invalid."),
    artist_legal_name: z.string().min(1, "Artist legal name is required."),
    artist_country: z.string().min(1, "Artist country is required."),
    artist_city: z.string().min(1, "Artist city is required."),
    artists_count: z.enum(["1", "2", "3", "4", "5+"]),
    bulk_artist_list: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.cover_option === "LINK" && !data.cover_link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cover link is required for LINK option.",
        path: ["cover_link"],
      });
    }
    if (data.cover_option === "LABEL_DESIGN") {
      if (!data.cover_brief) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Design brief is required for label design.",
          path: ["cover_brief"],
        });
      }
      const hasReference = Boolean(data.cover_reference_link);
      if (!hasReference && !data.cover_label_discretion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Provide a reference link or choose label discretion for label design.",
          path: ["cover_reference_link"],
        });
      }
    }
    if (data.artists_count === "5+" && !data.bulk_artist_list) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bulk artist list is required for 5+ artists.",
        path: ["bulk_artist_list"],
      });
    }
  });

export const adminSubmissionStatusSchema = z.enum(SUBMISSION_STATUSES);
export const adminReleaseStatusSchema = z.enum(RELEASE_STATUSES);
