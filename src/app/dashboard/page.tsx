"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileTextIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./page.module.css";

const ResumeIntake = dynamic(
  () => import("@/components/resume-intake").then((m) => m.ResumeIntake),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-4 text-xs text-muted-foreground">
        Loading resume workspace…
      </div>
    ),
  }
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState<boolean>(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  async function checkResumeStatus() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("users")
          .select("resume_id")
          .eq("id", user.id)
          .single();

        if (profileData?.resume_id) {
          const { data: resumeRow } = await supabase
            .from("resumes")
            .select("file_name, storage_url, created_at")
            .eq("id", profileData.resume_id)
            .single();

          setHasResume(!!resumeRow);
          setResumeName(resumeRow?.file_name ?? null);
          setResumeUrl(resumeRow?.storage_url ?? null);
          setResumeUploadedAt(resumeRow?.created_at ?? null);
        } else {
          setHasResume(false);
          setResumeName(null);
          setResumeUrl(null);
          setResumeUploadedAt(null);
        }
      }
    } catch (err) {
      console.error("Error checking resume status:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkResumeStatus();
  }, []);

  const handleStartInterview = () => {
    // Simple room id for now; can switch to UUID later
    const roomId = `interview_${Date.now()}`;
    router.push(`/interview/${roomId}`);
  };

  const handleResumeUploaded = () => {
    setShowUploader(false);
    setLoading(true);
    void checkResumeStatus();
  };

  return (
    <div>
      <main className={styles.dashboardPage}>
        <div className={styles.dashboardContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
                <header className="flex flex-col gap-2.5">
                  <Skeleton className="h-3 w-32 rounded-full" />
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="mt-1 h-4 w-full max-w-xl" />
                </header>

                <Card className="bg-card/80">
                  <CardContent className="py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <Skeleton className="mt-0.5 h-11 w-11 rounded-md" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-56" />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 md:mt-0 md:items-end">
                        <Skeleton className="h-8 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/80">
                  <CardContent className="py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full max-w-md" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <div className="mt-3 flex justify-start md:mt-0 md:justify-end">
                        <Skeleton className="h-9 w-40" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className={styles.dashboardContent}>
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:flex-row md:items-start md:gap-8">
                <div className="flex-1 flex flex-col gap-7">
                  <header className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      AI Interview Studio
                    </span>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.6rem]">
                      Interview workspace
                    </h1>
                    <p className="max-w-xl text-sm text-muted-foreground">
                      {hasResume
                        ? "Review your resume and keep everything in one place before you step into an AI practice interview."
                        : "Upload your resume to unlock a personalized AI interview tailored to your experience."}
                    </p>
                  </header>

                  {hasResume && !showUploader ? (
                    <Card className="bg-card/80">
                      <CardContent className="py-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                              <FileTextIcon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-sm font-medium text-foreground">
                                {resumeName ?? "Resume.pdf"}
                              </span>
                              {resumeUploadedAt && (
                                <span className="text-xs text-muted-foreground">
                                  Uploaded{" "}
                                  {new Date(resumeUploadedAt).toLocaleString()}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                This is the resume we use as the source of truth
                                for your AI interviews.
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:items-end">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (resumeUrl) {
                                    window.open(
                                      resumeUrl,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }
                                }}
                                disabled={!resumeUrl}
                              >
                                View resume
                              </Button>
                            </div>
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                              onClick={() => setShowUploader(true)}
                            >
                              Replace resume
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed bg-muted/40">
                      <CardContent className="py-5">
                        <div className="flex flex-col gap-2">
                          <h2 className="text-sm font-medium text-foreground">
                            Upload your resume to get started
                          </h2>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            We support PDF and common document formats up to
                            5MB. Once your resume is uploaded and parsed, you
                            can launch an AI practice interview that mirrors
                            real hiring panels.
                          </p>
                        </div>
                        <div className="mt-4">
                          <ResumeIntake
                            onResumeUploaded={handleResumeUploaded}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {hasResume && !showUploader && (
                    <Card className="bg-background/80">
                      <CardContent className="py-5">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-1">
                              <h2 className="text-sm font-semibold text-foreground">
                                AI practice interview
                              </h2>
                              <p className="text-xs text-muted-foreground sm:text-sm">
                                A guided, resume-aware session that simulates a
                                real hiring loop with behavioral, role-fit, and
                                light technical prompts.
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[11px] font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 border-transparent"
                            >
                              Ready to start
                            </Badge>
                          </div>

                          <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                            <div>
                              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground/80">
                                Session flow
                              </div>
                              <p className="mt-1">
                                5 min warm‑up, 25 min practice rounds, 15 min
                                structured reflection.
                              </p>
                            </div>
                            <div>
                              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground/80">
                                Rounds
                              </div>
                              <p className="mt-1">
                                Behavioral · Role fit · Scenario walkthroughs
                                tailored to your resume.
                              </p>
                            </div>
                            <div>
                              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground/80">
                                Before you start
                              </div>
                              <ul className="mt-1 space-y-1">
                                <li>
                                  Find a quiet space and stable connection.
                                </li>
                                <li>Have one recent project in mind.</li>
                                <li>
                                  Join from a laptop with mic &amp; camera.
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="mt-1 flex justify-start md:justify-end">
                            <Button
                              type="button"
                              onClick={handleStartInterview}
                            >
                              Start AI practice interview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <aside className="mt-6 md:mt-0 md:w-72 lg:w-80 shrink-0">
                  <Card className="h-full flex flex-col gap-5">
                    <CardContent className="py-5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h2 className="text-sm font-semibold text-foreground">
                            Your interview stats
                          </h2>
                          <p className="text-xs text-muted-foreground mt-1">
                            Snapshot of how you’re practicing with Talentflow.
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="px-2.5 py-0.5 text-[11px]"
                        >
                          Beta
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg bg-muted/60 px-3 py-2.5">
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Practice interviews
                          </div>
                          <div className="mt-1 text-lg font-semibold text-foreground">
                            0
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Completed sessions
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/60 px-3 py-2.5">
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Time spent
                          </div>
                          <div className="mt-1 text-lg font-semibold text-foreground">
                            0h
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Across all sessions
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/60 px-3 py-2.5">
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Performance
                          </div>
                          <div className="mt-1 flex items-baseline gap-1 text-lg font-semibold text-foreground">
                            <span>—</span>
                            <span className="text-[11px] font-normal text-emerald-600">
                              Stable
                            </span>
                          </div>
                          <div className="mt-1 flex h-8 items-end gap-0.5">
                            <div className="h-2 w-1.5 rounded-full bg-primary/40" />
                            <div className="h-3 w-1.5 rounded-full bg-primary/60" />
                            <div className="h-5 w-1.5 rounded-full bg-primary/80" />
                            <div className="h-4 w-1.5 rounded-full bg-primary/70" />
                            <div className="h-6 w-1.5 rounded-full bg-primary" />
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Trend over last week
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/60 px-3 py-2.5">
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Score
                          </div>
                          <div className="mt-1 text-lg font-semibold text-foreground">
                            —
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Overall rating
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 text-xs">
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Areas of improvement
                          </div>
                          <ul className="mt-1 space-y-1 text-muted-foreground">
                            <li className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              <span>
                                Structure answers with clear STAR format.
                              </span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              <span>
                                Slow down when walking through system designs.
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Specialisation
                          </div>
                          <p className="mt-1 text-muted-foreground">
                            Product engineering · Full‑stack · Early‑stage
                            startups
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
