"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { MainNavbar } from "@/components/main-navbar";
import { OtpPanel } from "@/components/otp-panel";
import { PrimaryButton } from "@/components/shared/primary-button";
import { TextInput } from "@/components/shared/text-input";
import styles from "./page.module.css";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowOtp(true);
  }

  return (
    <div>
      <MainNavbar />
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
                {!showOtp ? (
                  <>
                    <p>Enter your email and we&apos;ll send you a one-time code.</p>
                    <form className={styles["signin-form"]} onSubmit={handleSubmit}>
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
                      >
                        Send magic code
                      </PrimaryButton>
                      <p className={styles["signin-footnote"]}>
                        We&apos;ll email you a one-time code. No spam, ever. {" "}
                        <Link href="/create-account">
                          New here? Create an account.
                        </Link>
                      </p>
                    </form>
                  </>
                ) : (
                  <OtpPanel
                    email={email}
                    onEditEmail={() => setShowOtp(false)}
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
