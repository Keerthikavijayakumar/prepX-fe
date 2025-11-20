"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/shared/primary-button";
import styles from "./OtpPanel.module.css";

type OtpPanelProps = {
  email: string;
  onEditEmail?: () => void;
};

export function OtpPanel({ email, onEditEmail }: OtpPanelProps) {
  const [code, setCode] = useState("");

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
        We sent a one-time code to <span className={styles.email}>{email}</span>.
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
        <PrimaryButton type="button" className={styles.verifyButton}>
          Verify code
        </PrimaryButton>
      </div>
      <div className={styles.meta}>
        <button type="button" className={styles.link}>
          Resend code
        </button>
        <span className={styles.timer}>Code expires in 10 minutes</span>
      </div>
    </div>
  );
}
