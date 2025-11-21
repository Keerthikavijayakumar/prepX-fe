"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/shared/primary-button";
import { supabase } from "@/lib/supabaseClient";
import styles from "./OtpPanel.module.css";

type OtpPanelProps = {
  email: string;
  onEditEmail?: () => void;
  shouldCreateUser?: boolean;
  onVerified?: () => void;
};

export function OtpPanel({
  email,
  onEditEmail,
  shouldCreateUser = true,
  onVerified,
}: OtpPanelProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [expirySeconds, setExpirySeconds] = useState(600);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  async function handleVerify() {
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setError(null);
    setIsVerifying(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setError(error.message ?? "Invalid or expired code");
      setIsVerifying(false);
      return;
    }

    setIsVerifying(false);

    if (onVerified) {
      onVerified();
    } else if (data.session) {
      window.location.href = "/dashboard";
    }
  }

  async function handleResend() {
    if (resendSeconds > 0 || isResending) {
      return;
    }

    setError(null);
    setIsResending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser,
      },
    });

    if (error) {
      setError(error.message ?? "Failed to resend code");
      setIsResending(false);
      return;
    }

    setIsResending(false);
    setResendSeconds(60);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Enter verification code</h3>
        {onEditEmail && (
          <button type="button" className={styles.edit} onClick={onEditEmail}>
            Edit email
          </button>
        )}
      </div>
      <p className={styles.subtitle}>
        We sent a one-time code to <span className={styles.email}>{email}</span>
        .
      </p>
      <div className={styles.inputRow}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/[^0-9]/g, ""))
          }
          className={styles.input}
          placeholder="●●●●●●"
        />
        <PrimaryButton
          type="button"
          className={styles.verifyButton}
          disabled={isVerifying}
          onClick={handleVerify}
        >
          {isVerifying ? "Verifying..." : "Verify code"}
        </PrimaryButton>
      </div>
      <div className={styles.meta}>
        <button
          type="button"
          className={styles.link}
          onClick={handleResend}
          disabled={resendSeconds > 0 || isResending}
        >
          {isResending
            ? "Resending..."
            : resendSeconds > 0
            ? `Resend in ${resendSeconds}s`
            : "Resend code"}
        </button>
        <span className={styles.timer}>
          {expirySeconds > 0
            ? `Code expires in ${Math.floor(expirySeconds / 60)}:${String(
                expirySeconds % 60
              ).padStart(2, "0")}`
            : "Code has expired. Request a new code."}
        </span>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
