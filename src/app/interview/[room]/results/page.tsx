"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  XCircle,
  ArrowLeft,
  Play,
  Home,
  Share2,
  Download
} from "lucide-react";

import { interviewApi, type SessionResponse } from "@/lib/interviewClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { 
  ScoreDisplay, 
  FeedbackCards, 
  TranscriptViewer, 
  InterviewDetails 
} from "@/components/results";

interface ResultsPageProps {
  params: Promise<{
    room: string;
  }>;
}

export default function InterviewResultsPage({ params }: ResultsPageProps) {
  const router = useRouter();
  const { room: sessionId } = use(params);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await interviewApi.getSession(sessionId);
        
        if (!data) {
          setError("Interview session not found");
          setLoading(false);
          return;
        }

        setSession(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading results:", err);
        setError(err.message || "Failed to load interview results");
        setLoading(false);
      }
    }

    loadResults();
  }, [sessionId]);

  // Poll for results if score is not yet available (agent still processing)
  useEffect(() => {
    if (!session || session.score_overall !== null && session.score_overall !== undefined) return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await interviewApi.getSession(sessionId);
        if (data && data.score_overall !== null && data.score_overall !== undefined) {
          setSession(data);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [session, sessionId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-muted-foreground">
              Loading your interview results...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !session) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-lg font-semibold">Results Not Found</h2>
            <p className="text-sm text-muted-foreground">
              {error || "Unable to load interview results."}
            </p>
            <Button onClick={() => router.push("/dashboard")} className="mt-2">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const feedbackDetails = session.feedback_details || { strengths: [], weaknesses: [] };
  const transcript = session.transcript || [];
  const isEvaluating = session.score_overall === null || session.score_overall === undefined;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/3 -left-40 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-blue-500/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/10">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Interview Complete
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {session.target_role || "Practice Interview"} 
                    {session.target_company && ` • ${session.target_company}`}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Score Section */}
          <section 
            className="mb-8 rounded-3xl border border-border/50 bg-gradient-to-br from-background via-muted/10 to-background p-8 shadow-xl shadow-primary/5 animate-in fade-in zoom-in-95 duration-500"
            style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
          >
            <ScoreDisplay 
              score={session.score_overall} 
              isLoading={isEvaluating}
            />
          </section>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Main Content - Feedback */}
            <div className="lg:col-span-2 space-y-6">
              <FeedbackCards 
                feedbackDetails={feedbackDetails}
                summary={session.feedback_summary}
              />
            </div>

            {/* Sidebar - Interview Details */}
            <div className="lg:col-span-1">
              <InterviewDetails
                targetRole={session.target_role}
                targetCompany={session.target_company}
                complexity={session.complexity}
                durationMinutes={session.duration_minutes}
                startedAt={session.started_at}
                endedAt={session.ended_at}
              />
            </div>
          </div>

          {/* Transcript Section */}
          <TranscriptViewer transcript={transcript} />

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-3 mt-10 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "500ms", animationFillMode: "backwards" }}
          >
            <Button
              onClick={() => router.push("/history")}
              variant="ghost"
              size="lg"
            >
              View All History
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="lg"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => router.push("/dashboard?start=true")}
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Play className="h-4 w-4 mr-2" />
              New Interview
            </Button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
