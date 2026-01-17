"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type SignUpForm = {
  email: string;
  password: string;
  displayName: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<SignUpForm>();

  const onSubmit = async (data: SignUpForm) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName,
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    await fetch("/api/admin/bootstrap", { method: "POST" });
    router.push("/submit");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="font-serif text-3xl">Create account</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input type="text" required {...register("displayName")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" required {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" required {...register("password")} />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-[var(--ink)]/70">
          Already have an account?{" "}
          <Link className="font-semibold text-[var(--accent)]" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
