"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OtpPanel } from "@/components/OtpPanel";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SignInPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [name, setName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const isEmailStep = !needsName && !showOtp;
  const isOtpStep = !needsName && showOtp;
  const isNameStep = needsName;

  const cardTitle = isNameStep
    ? "Complete your profile"
    : isOtpStep
    ? "Verify your email"
    : "Welcome back";

  const cardDescription = isNameStep
    ? "Add your name so we can personalize interview feedback and reports."
    : isOtpStep
    ? "For security, we use a short-lived 6-digit code instead of passwords."
    : "Sign in with a one-time code — no passwords, no friction.";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      }

      function SignInPageInner() {
        return (
          <Suspense fallback={null}>
            <SignInPageInner />
          </Suspense>
        );
      }
    });
  }, [router]);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");

    if (emailFromQuery) {
      setEmail(emailFromQuery.trim().toLowerCase());
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setEmail(normalizedEmail);
    setError(null);
    setIsSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(
        "We couldn’t send your login code right now. Please wait a few seconds and try again."
      );
      setIsSending(false);
      return;
    }

    setShowOtp(true);
    setIsSending(false);
  }

  async function handleOtpVerified() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      router.replace("/sign-in");
      return;
    }

    const meta = (data.user as any).user_metadata ?? {};
    const displayName = (meta.display_name ?? meta.name ?? "").trim();

    if (displayName) {
      router.replace("/dashboard");
      return;
    }

    setShowOtp(false);
    setNeedsName(true);
  }

  async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Please enter your full name");
      return;
    }

    setError(null);
    setIsUpdatingName(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: trimmedName,
      },
    });

    if (error) {
      setIsUpdatingName(false);
      setError(
        "We couldn’t save your name right now. Please wait a few seconds and try again."
      );
      return;
    }

    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult?.user;

    if (user) {
      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          name: trimmedName,
          email: user.email ?? "",
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        console.error("Failed to upsert user into users table", upsertError);
      }
    }

    setIsUpdatingName(false);
    router.replace("/dashboard");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-1/2 aspect-[1108/632] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 via-emerald-500/10 to-sky-500/30 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:justify-between lg:py-16">
        {/* Left: narrative copy */}
        <div className="max-w-md space-y-6">
          <Badge className="border-primary/30 bg-primary/10 text-xs font-medium text-primary">
            Private beta · Passwordless access
          </Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Sign in to continue your Panelroom.io interview journey.
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            One secure magic link to your inbox. No passwords, no friction.
            Resume system design, coding, or behavioral sessions exactly where
            you left off.
          </p>

          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">
                For existing candidates
              </div>
              <p>Pick up your previous mock interviews in a single click.</p>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">
                Enterprise-grade security
              </div>
              <p>Short-lived OTP codes, built for modern security teams.</p>
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md">
          <Card className="border-border/70 bg-card/90 shadow-lg shadow-black/10 backdrop-blur">
            <CardHeader>
              <CardTitle>{cardTitle}</CardTitle>
              <CardDescription>{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {needsName ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Tell us your name so we can personalize your sessions.
                  </p>
                  <form className="space-y-4" onSubmit={handleNameSubmit}>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="full-name"
                        className="text-sm font-medium text-foreground"
                      >
                        Full name
                      </Label>
                      <Input
                        id="full-name"
                        name="full-name"
                        type="text"
                        placeholder="Ada Lovelace"
                        value={name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setName(event.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isUpdatingName}
                    >
                      {isUpdatingName && <Spinner className="size-3.5" />}
                      <span>{isUpdatingName ? "Saving..." : "Continue"}</span>
                    </Button>
                    {error && (
                      <p className="text-xs text-destructive">{error}</p>
                    )}
                  </form>
                </>
              ) : !showOtp ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we&apos;ll send you a one-time code.
                  </p>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setEmail(event.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isSending}
                    >
                      {isSending && <Spinner className="size-3.5" />}
                      <span>{isSending ? "Sending..." : "Send code"}</span>
                    </Button>
                    {error && (
                      <p className="text-xs text-destructive">{error}</p>
                    )}
                  </form>
                </>
              ) : (
                <OtpPanel
                  email={email}
                  onEditEmail={() => setShowOtp(false)}
                  shouldCreateUser={true}
                  onVerified={handleOtpVerified}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  );
}
