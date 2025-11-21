"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OtpPanel } from "@/components/otp-panel";
import { PrimaryButton } from "@/components/shared/primary-button";
import { TextInput } from "@/components/shared/text-input";
import { supabase } from "@/lib/supabaseClient";
import styles from "./page.module.css";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [name, setName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
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
    <div>
      <main className={styles["signin-page"]}>
        <div className={`container ${styles["signin-container"]}`}>
          <div className={styles["signin-card"]}>
            <div className="signin-left">
              <div className={styles["signin-badge"]}>Private beta access</div>
              <h1>Sign in to continue your mock interview.</h1>
              <p>
                One secure link to your inbox. No passwords, no friction. Enter
                your email to resume your DevMock.ai profile.
              </p>
              <div className={styles["signin-highlight-grid"]}>
                <div>
                  <h3>For existing candidates</h3>
                  <p>Pick up exactly where you left off.</p>
                </div>
                <div>
                  <h3>No password fatigue</h3>
                  <p>Just a short-lived magic code, built for security.</p>
                </div>
              </div>
            </div>
            <div className={styles["signin-right"]}>
              <div className={styles["signin-panel"]}>
                <h2>Welcome back</h2>
                {needsName ? (
                  <>
                    <p>
                      Tell us your name so we can personalize your sessions.
                    </p>
                    <form
                      className={styles["signin-form"]}
                      onSubmit={handleNameSubmit}
                    >
                      <div className={styles["signin-field"]}>
                        <label htmlFor="full-name">Full name</label>
                        <TextInput
                          id="full-name"
                          name="full-name"
                          type="text"
                          placeholder="Ada Lovelace"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                        />
                      </div>
                      <PrimaryButton
                        type="submit"
                        className={styles["signin-submit"]}
                        fullWidth
                        disabled={isUpdatingName}
                      >
                        {isUpdatingName ? "Saving..." : "Continue"}
                      </PrimaryButton>
                      {error && (
                        <p className={styles["signin-error"]}>{error}</p>
                      )}
                    </form>
                  </>
                ) : !showOtp ? (
                  <>
                    <p>
                      Enter your email and we&apos;ll send you a one-time code.
                    </p>
                    <form
                      className={styles["signin-form"]}
                      onSubmit={handleSubmit}
                    >
                      <div className={styles["signin-field"]}>
                        <label htmlFor="email">Email address</label>
                        <TextInput
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      </div>
                      <PrimaryButton
                        type="submit"
                        className={styles["signin-submit"]}
                        fullWidth
                        disabled={isSending}
                      >
                        {isSending ? "Sending..." : "Send code"}
                      </PrimaryButton>
                      {error && (
                        <p className={styles["signin-error"]}>{error}</p>
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
