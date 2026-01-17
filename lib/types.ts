export const SUBMISSION_STATUSES = [
  "NEW",
  "OK",
  "NEEDS_FIX",
  "DESIGN_REQUESTED",
  "REJECTED",
] as const;

export const RELEASE_STATUSES = [
  "IN_PREP",
  "APPROVED",
  "SCHEDULED",
  "REJECTED",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export type Participant = {
  role: string;
  fullname: string;
  country: string;
  city: string;
  email: string;
  spotify: string;
};

export type SubmissionPayload = {
  track_name: string;
  artists_display: string;
  cover_option: "LINK" | "LABEL_DESIGN";
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
  artists_count: "1" | "2" | "3" | "4" | "5+";
  bulk_artist_list: string | null;
};

