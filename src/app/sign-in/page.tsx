"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Shield, Zap, ArrowLeft } from "lucide-react";
import { OtpPanel } from "@/components/OtpPanel";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Google Icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Feature item component
function FeatureItem({ icon: Icon, text }: { icon: typeof Shield; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 text-primary/70" />
      <span>{text}</span>
    </div>
  );
}

function SignInPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [name, setName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

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
      setError("We couldn't send your code. Please try again.");
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
    const displayName = (meta.display_name ?? meta.name ?? meta.full_name ?? "").trim();

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
      data: { display_name: trimmedName },
    });

    if (error) {
      setIsUpdatingName(false);
      setError("We couldn't save your name. Please try again.");
      return;
    }

    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult?.user;

    if (user) {
      await supabase.from("users").upsert(
        { id: user.id, name: trimmedName, email: user.email ?? "" },
        { onConflict: "id" }
      );
    }

    setIsUpdatingName(false);
    router.replace("/dashboard");
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  // Render different card content based on step
  const renderContent = () => {
    // Step 3: Name collection (for new users)
    if (needsName) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Almost there!</h2>
            <p className="text-sm text-muted-foreground">
              What should we call you?
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleNameSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full-name">Your name</Label>
              <Input
                id="full-name"
                name="full-name"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                autoFocus
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isUpdatingName}
            >
              {isUpdatingName ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Saving...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </form>
        </motion.div>
      );
    }

    // Step 2: OTP verification
    if (showOtp) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <button
            onClick={() => setShowOtp(false)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <OtpPanel
            email={email}
            onEditEmail={() => setShowOtp(false)}
            shouldCreateUser={true}
            onVerified={handleOtpVerified}
          />
        </motion.div>
      );
    }

    // Step 1: Initial sign-in options
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Google Sign In - Primary option */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-base font-medium border-2 hover:bg-accent"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Spinner className="mr-2 size-5" />
          ) : (
            <GoogleIcon className="mr-2 size-5" />
          )}
          {isGoogleLoading ? "Connecting..." : "Continue with Google"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground uppercase tracking-wide">
            or
          </span>
        </div>

        {/* Email OTP form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="h-11"
              autoComplete="email"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Spinner className="mr-2 size-4" />
                Sending code...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send magic code
              </>
            )}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-primary/20 via-emerald-500/10 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      {/* Content */}
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4">
        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          <Card className="border-border/60 bg-card/95 shadow-xl shadow-black/5 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">
                {needsName ? "Complete your profile" : showOtp ? "Check your email" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-base">
                {needsName
                  ? "One last step to personalize your experience"
                  : showOtp
                  ? `We sent a code to ${email}`
                  : "Sign in to continue your interview prep"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust indicators */}
        {!showOtp && !needsName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6"
          >
            <FeatureItem icon={Shield} text="No passwords required" />
            <FeatureItem icon={Zap} text="Instant access" />
            <FeatureItem icon={Mail} text="Secure magic links" />
          </motion.div>
        )}

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </motion.div>
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
