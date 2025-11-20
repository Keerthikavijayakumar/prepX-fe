"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { MainNavbar } from "@/components/main-navbar";
import { OtpPanel } from "@/components/otp-panel";
import { PrimaryButton } from "@/components/shared/primary-button";
import { TextInput } from "@/components/shared/text-input";
import styles from "./page.module.css";

export default function CreateAccountPage() {
  const [name, setName] = useState("");
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
              <div className={styles["signin-badge"]}>New to DevMock.ai</div>
              <h1>Create your interview profile.</h1>
              <p>
                Tell us who you are and where you&apos;re headed. We&apos;ll tailor every
                mock interview to your tech stack and target roles.
              </p>
              <div className={styles["signin-highlight-grid"]}>
                <div>
                  <h3>Personalized sessions</h3>
                  <p>Questions calibrated to your experience level.</p>
                </div>
                <div>
                  <h3>Instant access</h3>
                  <p>Create an account and start a session in under a minute.</p>
                </div>
              </div>
            </div>
            <div className={styles["signin-right"]}>
              <div className={styles["signin-panel"]}>
                <h2>Create account</h2>
                {!showOtp ? (
                  <>
                    <p>Share your name and email to receive a one-time code.</p>
                    <form className={styles["signin-form"]} onSubmit={handleSubmit}>
                      <div className={styles["signin-field"]}>
                        <label htmlFor="name">Full name</label>
                        <TextInput
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Ada Lovelace"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                        />
                      </div>
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
                        We&apos;ll email you a one-time code. No passwords to remember. {" "}
                        <Link href="/sign-in">Already have an account? Sign in.</Link>
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
