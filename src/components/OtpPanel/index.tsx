"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">
            Enter your 6-digit code
          </h3>
          <p className="text-xs text-muted-foreground">
            We just sent it to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        {onEditEmail && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 text-xs"
            onClick={onEditEmail}
          >
            Edit email
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label
            htmlFor="otp-code"
            className="text-xs font-medium text-foreground"
          >
            6-digit code
          </Label>
          <Input
            id="otp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/[^0-9]/g, ""))
            }
            className="font-mono tracking-[0.35em] text-base"
            placeholder="••••••"
          />
        </div>
        <Button
          type="button"
          className="mt-1 w-full sm:mt-0 sm:w-auto"
          disabled={isVerifying}
          onClick={handleVerify}
        >
          {isVerifying ? "Verifying..." : "Verify code"}
        </Button>
      </div>
      <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={handleResend}
          disabled={resendSeconds > 0 || isResending}
        >
          {isResending
            ? "Resending..."
            : resendSeconds > 0
            ? `Resend in ${resendSeconds}s`
            : "Resend code"}
        </Button>
        <span className="text-[11px] sm:text-xs">
          {expirySeconds > 0
            ? `Code expires in ${Math.floor(expirySeconds / 60)}:${String(
                expirySeconds % 60
              ).padStart(2, "0")}`
            : "Code has expired. Request a new code."}
        </span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
