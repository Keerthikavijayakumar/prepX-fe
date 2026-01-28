"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  AlertCircle, 
  Target, 
  ArrowRight,
  CheckCircle2,
  Mic,
  Clock,
  Zap,
  Brain,
  Check,
  Rocket
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { interviewApi, getErrorMessage, type InterviewHistoryItem } from "@/lib/interviewClient";
import { statsApi, type UserStats, type Achievement } from "@/lib/statsClient";
import { HeroSection } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ProtectedRoute } from "@/components/auth/protected-route";

// Lightweight skeleton components for lazy loaded components
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
      ))}
    </div>
  );
}

function HistoryGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
      ))}
    </div>
  );
}

// Lazy load non-critical components for better initial load
const StatsCards = dynamic(
  () => import("@/components/dashboard/stats-cards").then(mod => ({ default: mod.StatsCards })),
  { ssr: false, loading: () => <StatsCardsSkeleton /> }
);

const InterviewHistoryGrid = dynamic(
  () => import("@/components/dashboard/interview-history-card").then(mod => ({ default: mod.InterviewHistoryGrid })),
  { ssr: false, loading: () => <HistoryGridSkeleton /> }
);

const AchievementNotification = dynamic(
  () => import("@/components/dashboard/achievement-notification").then(mod => ({ default: mod.AchievementNotification })),
  { ssr: false, loading: () => null }
);

// Lazy load the heavy modal component - only loaded when needed
const InterviewConfigModal = dynamic(
  () => import("@/components/dashboard/interview-config-modal").then(mod => ({ default: mod.InterviewConfigModal })),
  { ssr: false, loading: () => null }
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState<boolean>(false);
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string | null>(null);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState<number>(0);
  const [missingItems, setMissingItems] = useState<string[]>([]);

  // Interview eligibility state
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [canStartInterview, setCanStartInterview] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);

  // Interview history state
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // User stats and achievements state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unnotifiedAchievements, setUnnotifiedAchievements] = useState<Achievement[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Interview configuration modal state
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Handle URL query param to auto-open interview modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("start") === "true" && canStartInterview && !loading) {
      setShowConfigModal(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [canStartInterview, loading, router]);

  async function checkResumeStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: profileData } = await supabase
        .from("users")
        .select("resume_id, profile_completion_percentage")
        .eq("id", user.id)
        .single();

      setProfileCompletionPercentage(profileData?.profile_completion_percentage || 0);

      if (profileData?.resume_id) {
        const { data: resumeRow } = await supabase
          .from("resumes")
          .select("file_name, storage_url, created_at, parsed_data")
          .eq("id", profileData.resume_id)
          .single();

        setHasResume(!!resumeRow);
        setResumeUploadedAt(resumeRow?.created_at ?? null);

        if (resumeRow?.parsed_data) {
          const parsedData = resumeRow.parsed_data;
          const missingFields = [];

          if (!parsedData.basic_info?.summary) missingFields.push("Summary");
          if (!parsedData.work_experience?.length) missingFields.push("Experience");
          if (!parsedData.education?.length) missingFields.push("Education");
          if (!parsedData.skills?.length) missingFields.push("Skills");

          setMissingItems(missingFields);
        }
      } else {
        setHasResume(false);
        setResumeUploadedAt(null);
        setMissingItems(["Resume"]);
      }
    } catch (err) {
      console.error("Error checking resume status:", err);
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkResumeStatus();
    loadInterviewHistory();
    loadUserStats();
  }, []);

  async function loadUserStats() {
    setStatsLoading(true);
    try {
      const data = await statsApi.getDashboardStats();
      setUserStats(data.stats);
      setAchievements(data.recent_achievements);
      setUnnotifiedAchievements(data.unnotified_achievements);
    } catch (err) {
      console.error("Error loading user stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function handleDismissAchievements(achievementIds: string[]) {
    try {
      await statsApi.markAchievementsNotified(achievementIds);
      setUnnotifiedAchievements([]);
    } catch (err) {
      console.error("Error dismissing achievements:", err);
    }
  }

  async function loadInterviewHistory() {
    setHistoryLoading(true);
    try {
      const history = await interviewApi.getHistory();
      setInterviewHistory(history);
    } catch (err) {
      console.error("Error loading interview history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function checkInterviewEligibility() {
    if (!hasResume) {
      setCanStartInterview(false);
      setEligibilityError("NO_RESUME");
      return;
    }

    setEligibilityLoading(true);
    setEligibilityError(null);

    try {
      const result = await interviewApi.checkEligibility();

      if (result.success) {
        setCanStartInterview(true);
        setEligibilityError(null);
        setExistingSessionId(null);
      } else {
        setCanStartInterview(false);
        setEligibilityError(result.error || "UNKNOWN_ERROR");

        if (result.error === "ACTIVE_SESSION_EXISTS" && result.existingSessionId) {
          setExistingSessionId(result.existingSessionId);
        } else {
          setExistingSessionId(null);
        }
      }
    } catch (error) {
      console.error("Failed to check eligibility:", error);
      setCanStartInterview(false);
      setEligibilityError("NETWORK_ERROR");
      setExistingSessionId(null);
    } finally {
      setEligibilityLoading(false);
    }
  }

  useEffect(() => {
    if (!loading && hasResume) {
      checkInterviewEligibility();
    }
  }, [loading, hasResume]);

  function handleStartInterview() {
    if (!canStartInterview) return;
    setShowConfigModal(true);
  }

  // Loading skeleton
  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen px-4 pt-8 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
              <div className="space-y-5">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 contain-layout">
          {/* Hero Section - fixed height to prevent CLS */}
          <div className="mb-8 min-h-[180px] md:min-h-[160px]">
            <HeroSection
              hasResume={hasResume}
              canStartInterview={canStartInterview}
              isLoading={eligibilityLoading}
              onStartInterview={handleStartInterview}
              onEditProfile={() => router.push("/resume")}
            />
          </div>

          {/* Stats Cards - Show only if user has interviews */}
          {userStats && userStats.total_interviews > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
                {userStats.streak_at_risk && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Practice today to keep your streak!
                  </span>
                )}
              </div>
              <StatsCards stats={userStats} loading={statsLoading} />
            </div>
          )}

          {/* Quick Actions Row - fixed min-height to prevent CLS */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8 min-h-[200px]">
            {/* Profile Status Card */}
            <div
              className={`relative overflow-hidden rounded-2xl p-5 border ${
                profileCompletionPercentage === 100 
                  ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20" 
                  : "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${
                  profileCompletionPercentage === 100 
                    ? "bg-emerald-500/20" 
                    : "bg-amber-500/20"
                }`}>
                  {profileCompletionPercentage === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <span className={`text-2xl font-bold ${
                  profileCompletionPercentage === 100 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  {profileCompletionPercentage}%
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {profileCompletionPercentage === 100 ? "Profile Complete" : "Complete Profile"}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {profileCompletionPercentage === 100 
                  ? "Your profile is optimized for personalized interviews" 
                  : "Better profile = better interview questions"}
              </p>
              <Progress
                value={profileCompletionPercentage}
                className={`h-1.5 ${
                  profileCompletionPercentage === 100 
                    ? "[&>div]:bg-emerald-500" 
                    : "[&>div]:bg-amber-500"
                }`}
              />
              {missingItems.length > 0 && profileCompletionPercentage < 100 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {missingItems.map((item, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tips Card */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground">Interview Tips</h3>
              </div>
              <ul className="space-y-2">
                {[
                  "Use STAR format for behavioral questions",
                  "Speak clearly and take your time",
                  "Have specific examples ready",
                  "Ask clarifying questions"
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements Card */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-foreground">Before You Start</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Mic className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Microphone</p>
                    <p className="text-xs text-muted-foreground">Enable audio access</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">15-30 Minutes</p>
                    <p className="text-xs text-muted-foreground">Uninterrupted time</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Error Alert */}
          {eligibilityError && !eligibilityLoading && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{getErrorMessage(eligibilityError)}</p>
                  {eligibilityError === "ACTIVE_SESSION_EXISTS" && existingSessionId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push(`/interview/${existingSessionId}`)}
                    >
                      Rejoin Active Interview
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interview History Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Interview History</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {interviewHistory.length > 0 
                    ? `${interviewHistory.length} practice session${interviewHistory.length !== 1 ? 's' : ''} completed`
                    : "Start your first interview to track progress"}
                </p>
              </div>
              {interviewHistory.length > 6 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={() => router.push("/history")}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <InterviewHistoryGrid
              interviews={interviewHistory.slice(0, 6)}
              loading={historyLoading}
              onInterviewClick={(id) => router.push(`/interview/${id}/results`)}
            />

            {interviewHistory.length > 6 && (
              <div className="flex justify-center mt-6 sm:hidden">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/history")}
                >
                  View All Interviews
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Achievement Notification */}
      <AchievementNotification
        achievements={unnotifiedAchievements}
        onDismiss={handleDismissAchievements}
      />

      {/* Interview Configuration Modal - Lazy loaded for performance */}
      {showConfigModal && (
        <InterviewConfigModal
          open={showConfigModal}
          onOpenChange={setShowConfigModal}
        />
      )}
    </ProtectedRoute>
  );
}
