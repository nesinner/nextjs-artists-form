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

type SignInForm = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<SignInForm>();

  const onSubmit = async (data: SignInForm) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await fetch("/api/admin/bootstrap", { method: "POST" });
    router.push("/submit");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="font-serif text-3xl">Welcome back</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-[var(--ink)]/70">
          Need an account?{" "}
          <Link className="font-semibold text-[var(--accent)]" href="/auth/sign-up">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
