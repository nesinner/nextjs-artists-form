"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Participant, SubmissionPayload } from "@/lib/types";
import { submissionSchema } from "@/lib/validators";

type SubmissionFormValues = SubmissionPayload & {
  participants: Participant[];
};

const emptyParticipant = (): Participant => ({
  role: "",
  fullname: "",
  country: "",
  city: "",
  email: "",
  spotify: "",
});

const defaultValues: SubmissionFormValues = {
  track_name: "",
  artists_display: "",
  cover_option: "LINK",
  cover_link: "",
  cover_brief: "",
  cover_reference_link: "",
  cover_label_discretion: false,
  audio_link: "",
  spotify_link: "",
  tiktok_link: "",
  artist_email: "",
  artist_legal_name: "",
  artist_country: "",
  artist_city: "",
  artists_count: "1",
  bulk_artist_list: "",
  participants: [emptyParticipant(), emptyParticipant(), emptyParticipant(), emptyParticipant()],
};

type SubmitFormProps = {
  profileEmail: string;
};

export function SubmitForm({ profileEmail }: SubmitFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftToken, setDraftToken] = useState<string | null>(null);
  const [statusToken, setStatusToken] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const lastSavedRef = useRef<string>("");

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!form.getValues("artist_email")) {
      form.setValue("artist_email", profileEmail);
    }
  }, [form, profileEmail]);

  const artistsCount = form.watch("artists_count");
  const coverOption = form.watch("cover_option");

  const watchAll = form.watch();

  useEffect(() => {
    const queryToken = searchParams.get("draft");
    const existing = queryToken || localStorage.getItem("draft_token");
    if (existing) {
      setDraftToken(existing);
      return;
    }
    const newToken = crypto.randomUUID().slice(0, 8);
    const params = new URLSearchParams(searchParams.toString());
    params.set("draft", newToken);
    router.replace(`/submit?${params.toString()}`);
    localStorage.setItem("draft_token", newToken);
    setDraftToken(newToken);
  }, [router, searchParams]);

  useEffect(() => {
    if (!draftToken) return;
    fetch(`/api/drafts?token=${draftToken}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.data) {
          form.reset({
            ...defaultValues,
            ...payload.data,
            participants:
              payload.data.participants?.length >= 4
                ? payload.data.participants
                : [
                    ...(payload.data.participants ?? []),
                    ...Array.from({ length: 4 - (payload.data.participants?.length ?? 0) }, () =>
                      emptyParticipant()
                    ),
                  ],
          });
        }
      })
      .catch(() => {
        setSaveError("Unable to load draft.");
      });
  }, [draftToken, form]);

  useEffect(() => {
    if (!draftToken) return;
    const payload = form.getValues();
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) {
      return;
    }
    lastSavedRef.current = serialized;
    setSaving(true);
    setSaveError(null);
    fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: draftToken, data: payload }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Draft save failed");
        }
      })
      .catch(() => {
        setSaveError("Draft autosave failed.");
      })
      .finally(() => setSaving(false));
  }, [watchAll, draftToken, form]);

  const onSubmit = async (values: SubmissionFormValues) => {
    setSaveError(null);
    const participantCount =
      values.artists_count === "2" ||
      values.artists_count === "3" ||
      values.artists_count === "4"
        ? Number(values.artists_count)
        : 0;
    const participants = participantCount
      ? values.participants.slice(0, participantCount)
      : [];
    const payload = {
      ...values,
      participants,
      cover_link: values.cover_option === "LINK" ? values.cover_link : null,
      cover_brief: values.cover_option === "LABEL_DESIGN" ? values.cover_brief : null,
      cover_reference_link:
        values.cover_option === "LABEL_DESIGN" ? values.cover_reference_link : null,
      cover_label_discretion:
        values.cover_option === "LABEL_DESIGN" ? values.cover_label_discretion : false,
      bulk_artist_list: values.artists_count === "5+" ? values.bulk_artist_list : null,
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setSaveError(result?.error?.formErrors?.[0] ?? "Submission failed.");
      return;
    }
    if (draftToken) {
      await fetch(`/api/drafts?token=${draftToken}`, { method: "DELETE" });
    }
    setStatusToken(result.data.public_token);
    setStatusId(result.data.id);
    form.reset(defaultValues);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h1 className="font-serif text-3xl">Artist submission</h1>
          <p className="text-sm text-[var(--ink)]/70">
            Signed in as {profileEmail}. Drafts auto-save as you edit.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {statusToken && (
            <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm">
              <p className="font-semibold">Submission created.</p>
              <p>ID: {statusId}</p>
              <p>
                Status token:{" "}
                <span className="font-semibold">{statusToken}</span>
              </p>
              <Link
                className="font-semibold text-[var(--accent)]"
                href={`/status?token=${statusToken}`}
              >
                View status →
              </Link>
            </div>
          )}

          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Track name *</Label>
                <Input {...form.register("track_name")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Artists display *</Label>
                <Input {...form.register("artists_display")} />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cover option *</Label>
                <Select {...form.register("cover_option")}>
                  <option value="LINK">Link</option>
                  <option value="LABEL_DESIGN">Label design</option>
                </Select>
              </div>
              {coverOption === "LINK" ? (
                <div className="space-y-2 md:col-span-1">
                  <Label>Cover link *</Label>
                  <Input {...form.register("cover_link")} />
                </div>
              ) : (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Design brief *</Label>
                    <Textarea {...form.register("cover_brief")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference link</Label>
                    <Input {...form.register("cover_reference_link")} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={form.watch("cover_label_discretion")}
                      onChange={(event) =>
                        form.setValue(
                          "cover_label_discretion",
                          event.currentTarget.checked
                        )
                      }
                    />
                    <Label>No references, leave to label</Label>
                  </div>
                </>
              )}
              <div className="space-y-2 md:col-span-2">
                <Label>Audio link *</Label>
                <Input {...form.register("audio_link")} />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Spotify link *</Label>
                <Input {...form.register("spotify_link")} />
              </div>
              <div className="space-y-2">
                <Label>TikTok link</Label>
                <Input {...form.register("tiktok_link")} />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Artist email *</Label>
                <Input {...form.register("artist_email")} />
              </div>
              <div className="space-y-2">
                <Label>Artist legal name *</Label>
                <Input {...form.register("artist_legal_name")} />
              </div>
              <div className="space-y-2">
                <Label>Artist country *</Label>
                <Input {...form.register("artist_country")} />
              </div>
              <div className="space-y-2">
                <Label>Artist city *</Label>
                <Input {...form.register("artist_city")} />
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-2 max-w-xs">
                <Label>Artists count *</Label>
                <Select {...form.register("artists_count")}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </Select>
              </div>
              {["2", "3", "4"].includes(artistsCount) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {form.watch("participants").slice(0, Number(artistsCount)).map((_, idx) => (
                    <Card key={`participant-${idx}`} className="border border-[var(--ink)]/10">
                      <CardHeader>
                        <h3 className="font-semibold">Participant {idx + 1}</h3>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input
                          placeholder="Role"
                          {...form.register(`participants.${idx}.role` as const)}
                        />
                        <Input
                          placeholder="Full name"
                          {...form.register(`participants.${idx}.fullname` as const)}
                        />
                        <Input
                          placeholder="Country"
                          {...form.register(`participants.${idx}.country` as const)}
                        />
                        <Input
                          placeholder="City"
                          {...form.register(`participants.${idx}.city` as const)}
                        />
                        <Input
                          placeholder="Email"
                          {...form.register(`participants.${idx}.email` as const)}
                        />
                        <Input
                          placeholder="Spotify link"
                          {...form.register(`participants.${idx}.spotify` as const)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {artistsCount === "5+" && (
                <div className="space-y-2">
                  <Label>Bulk artist list *</Label>
                  <Textarea {...form.register("bulk_artist_list")} />
                </div>
              )}
            </section>

            {saveError && <p className="text-sm text-[var(--danger)]">{saveError}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Submit</Button>
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/40">
                {saving ? "Saving draft..." : "Draft synced"}
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
