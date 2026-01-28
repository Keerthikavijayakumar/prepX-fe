"use client";

import { Play, Sparkles, ArrowRight, Mic, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  userName?: string;
  hasResume: boolean;
  canStartInterview: boolean;
  isLoading?: boolean;
  onStartInterview: () => void;
  onEditProfile: () => void;
}

export function HeroSection({
  userName,
  hasResume,
  canStartInterview,
  isLoading,
  onStartInterview,
  onEditProfile,
}: HeroSectionProps) {
  const firstName = userName?.split(" ")[0] || "there";
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-primary/10 via-primary/5 to-background",
        "border border-primary/10",
        "p-6 md:p-8"
      )}
    >
      {/* Decorative elements - simplified for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left content */}
        <div className="space-y-4 max-w-xl">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Sparkles className="h-3 w-3" />
              AI-Powered Interview Practice
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {greeting}, {firstName}! 👋
            </h1>
          </div>

          <p
            className="text-muted-foreground text-sm md:text-base leading-relaxed"
          >
            {hasResume
              ? "Ready to ace your next interview? Practice with our AI interviewer and get instant feedback on your performance."
              : "Complete your profile to unlock personalized AI interview practice tailored to your experience."}
          </p>

          {/* Quick features */}
          {hasResume && (
            <div
              className="flex flex-wrap gap-4 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-primary/10">
                  <Mic className="h-3 w-3 text-primary" />
                </div>
                Voice Interview
              </span>
              <span className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-primary/10">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
                15-30 Minutes
              </span>
              <span className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-primary/10">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                Instant Feedback
              </span>
            </div>
          )}
        </div>

        {/* Right content - CTA */}
        <div
          className="flex flex-col gap-3"
        >
          {hasResume ? (
            <Button
              size="lg"
              onClick={onStartInterview}
              disabled={!canStartInterview || isLoading}
              className={cn(
                "relative overflow-hidden group",
                "bg-primary hover:bg-primary/90",
                "text-primary-foreground font-semibold",
                "px-8 py-6 text-base",
                "rounded-xl shadow-lg shadow-primary/25",
                "transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start Interview
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onEditProfile}
              className={cn(
                "bg-primary hover:bg-primary/90",
                "text-primary-foreground font-semibold",
                "px-8 py-6 text-base",
                "rounded-xl shadow-lg shadow-primary/25"
              )}
            >
              Complete Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {hasResume && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditProfile}
              className="text-muted-foreground hover:text-foreground"
            >
              Update Profile
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
