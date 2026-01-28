"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Target, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { interviewApi, type InterviewHistoryItem } from "@/lib/interviewClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProtectedRoute } from "@/components/auth/protected-route";

type ProfileData = {
  name: string | null;
  email: string | null;
  createdAt: string | null;
};

type InterviewStats = {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  totalPracticeTime: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load interview stats
  useEffect(() => {
    async function loadStats() {
      try {
        const history = await interviewApi.getHistory();
        if (history.length > 0) {
          const completedWithScores = history.filter(
            (i) => i.score_overall !== null && i.score_overall !== undefined
          );
          const scores = completedWithScores.map((i) => i.score_overall || 0);
          const totalTime = history.reduce((acc, i) => acc + (i.duration_minutes || 0), 0);
          
          setStats({
            totalInterviews: history.length,
            averageScore: scores.length > 0 
              ? scores.reduce((a, b) => a + b, 0) / scores.length 
              : 0,
            bestScore: scores.length > 0 ? Math.max(...scores) : 0,
            totalPracticeTime: totalTime,
          });
        }
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();
      console.log("supabase.auth.getUser()", data);

      // Also log the current auth access token for debugging
      const { data: sessionData } = await supabase.auth.getSession();
      console.log(
        "supabase.auth.getSession() access_token",
        sessionData.session?.access_token
      );
      if (error || !data.user) {
        router.replace("/sign-in");
        return;
      }

      const user = data.user as any;
      const meta = user.user_metadata ?? {};

      let name: string | null = (meta.display_name ?? meta.name ?? null) as
        | string
        | null;
      let email: string | null = (user.email ?? null) as string | null;
      let createdAt: string | null = null;

      try {
        const { data: rows, error: profileError } = await supabase
          .from("users")
          .select("name, email, created_at")
          .eq("id", user.id)
          .limit(1);

        if (!profileError && rows && rows.length > 0) {
          const row = rows[0] as {
            name: string | null;
            email: string | null;
            created_at: string | null;
          };

          name = row.name ?? name;
          email = row.email ?? email;
          createdAt = row.created_at ?? null;
        }
      } catch (loadError) {
        console.error("Failed to load profile from users table", loadError);
      }

      setProfile({ name, email, createdAt });
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const displayInitial =
    profile?.name?.trim()?.charAt(0)?.toUpperCase() ??
    profile?.email?.trim()?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <ProtectedRoute>
      <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
        <div className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-1/2 aspect-[1108/632] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 via-emerald-500/10 to-sky-500/30 opacity-30" />
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 lg:py-16">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold shadow-sm">
              {loading ? (
                <Skeleton className="h-6 w-6 rounded-full bg-primary-foreground/40" />
              ) : (
                displayInitial
              )}
            </div>
            <div className="space-y-1">
              <p className="inline-flex items-center rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Profile
              </p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage the identity and context your interviewers see first.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {loading ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Name
                      </span>
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Email
                      </span>
                      <Skeleton className="h-4 w-40 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between gap-4 pb-1">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Member since
                      </span>
                      <Skeleton className="h-4 w-28 rounded-full" />
                    </div>
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Name
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {profile?.name || "Not set yet"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Email
                      </span>
                      <span className="text-sm font-medium text-foreground break-all text-right">
                        {profile?.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 pb-1">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Member since
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Interview Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Target className="h-3 w-3" />
                          Total Interviews
                        </div>
                        <div className="text-xl font-bold">{stats.totalInterviews}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          Practice Time
                        </div>
                        <div className="text-xl font-bold">{stats.totalPracticeTime} min</div>
                      </div>
                    </div>
                    
                    {/* Scores */}
                    {stats.averageScore > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average Score</span>
                          <span className="font-medium">{stats.averageScore.toFixed(1)}/10</span>
                        </div>
                        <Progress value={stats.averageScore * 10} className="h-2" />
                        
                        <div className="flex justify-between text-sm mt-3">
                          <span className="text-muted-foreground">Best Score</span>
                          <Badge variant="secondary" className="text-emerald-600">
                            {stats.bestScore.toFixed(1)}/10
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Complete your first interview to see your stats here.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => router.push("/dashboard")}
                    >
                      Start Interview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </ProtectedRoute>
  );
}
