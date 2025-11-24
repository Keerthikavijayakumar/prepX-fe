"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(false);

  async function handleStartClick() {
    if (startLoading) return;
    setStartLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/sign-in");
      }
    } finally {
      setStartLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-background via-background to-background/80">
        <div className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-1/2 aspect-[1108/632] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 via-emerald-500/10 to-sky-500/30 opacity-40" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-24 md:flex-row md:items-center md:justify-between lg:gap-16 lg:pb-24 lg:pt-28">
          <div className="max-w-xl space-y-6">
            <Badge className="border-primary/30 bg-primary/10 text-xs font-medium text-primary">
              v2.0 · Enterprise-ready AI mock interviews
            </Badge>

            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Ship interview-ready engineers at
              <span className="text-primary"> enterprise scale.</span>
            </h1>

            <p className="text-balance text-sm text-muted-foreground sm:text-base">
              DevMock.ai runs thousands of AI-powered mock interviews per day —
              across coding, system design, and behavioral rounds — so your
              teams walk into real panels already calibrated to L5+
              expectations.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={handleStartClick}
                disabled={startLoading}
                className="w-full sm:w-auto"
              >
                Start Mock Interview
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Talk to sales
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-muted-foreground sm:text-sm md:grid-cols-3">
              <div>
                <div className="text-base font-semibold text-foreground sm:text-lg">
                  $250k+
                </div>
                <div>Median offer after 6 weeks</div>
              </div>
              <div>
                <div className="text-base font-semibold text-foreground sm:text-lg">
                  10k+
                </div>
                <div>AI-led mock interviews / day</div>
              </div>
              <div>
                <div className="text-base font-semibold text-foreground sm:text-lg">
                  40+
                </div>
                <div>Global enterprise customers</div>
              </div>
            </div>
          </div>

          {/* Right: IDE / session preview */}
          <div className="w-full max-w-md md:max-w-lg">
            <Card className="border-border/70 bg-card/80 shadow-lg shadow-black/10 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  devmock_session.py
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/5 text-[10px] uppercase tracking-wide text-emerald-400"
                >
                  Live AI panel
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 bg-muted/30 pt-4 font-mono text-[11px] leading-relaxed sm:text-xs">
                <p className="text-emerald-400/90">
                  # AI: Can you walk me through a design for a globally
                  distributed code execution engine?
                </p>
                <p>
                  def execute_job(job_id: str, payload: dict) -&gt;
                  ExecutionResult:
                </p>
                <p className="pl-4 text-muted-foreground">
                  """Distribute execution across regional workers with
                  millisecond tail latency guarantees."""
                </p>
                <p className="pl-4 text-muted-foreground">
                  # 1. Resolve tenant + region affinity
                </p>
                <p className="pl-4 text-muted-foreground">
                  region = router.pick_region(job_id,
                  constraints=payload.get("sla"))
                </p>
                <p className="pl-4 text-muted-foreground">
                  # 2. Fan-out to warm workers
                </p>
                <p className="pl-4 text-muted-foreground">
                  workers = scheduler.pick_workers(region, strategy="hedged")
                </p>
                <p className="pl-4 text-muted-foreground">
                  # 3. Stream tokens + scoring signals back to interviewer
                </p>
                <p className="pl-4 text-muted-foreground">
                  return orchestrator.run(workers, payload)
                </p>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/70 bg-background/60">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  Live coaching enabled
                </div>
                <Button size="sm" variant="ghost" className="text-xs">
                  View full transcript
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise feature grid */}
      <section className="border-b border-border/50 bg-background">
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 text-xs uppercase tracking-wide text-primary"
            >
              Platform
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Engineered for VP of Eng, loved by ICs.
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Standardize interview quality across every location, role, and
              level while giving candidates an experience that feels like
              pair-programming with your best engineers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>End-to-end interview OS</CardTitle>
                <CardDescription>
                  Coding, system design, and behavioral signals in a single
                  source of truth.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Calibrated L3–L7 scorecards and competencies.</p>
                <p>Structured rubrics with AI-generated written feedback.</p>
                <p>Seamless export into your ATS and internal systems.</p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Production-grade AI interviewers</CardTitle>
                <CardDescription>
                  Built on safety-reviewed, audited LLMs with enterprise SLAs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Latency-optimized serving on global edge infrastructure.</p>
                <p>
                  Scenario libraries tuned for FAANG and high-growth startups.
                </p>
                <p>Configurable difficulty curves and role profiles.</p>
              </CardContent>
            </Card>

            <Card className="h-full md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Enterprise controls</CardTitle>
                <CardDescription>
                  Built-in governance for security, privacy, and compliance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>SSO, SCIM, audit logs, and fine-grained role permissions.</p>
                <p>
                  PII-safe log retention policies and regional data residency.
                </p>
                <p>Dedicated environments and custom SLAs for global teams.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border/60 bg-background/80 px-6 py-8 shadow-sm shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:px-10">
            <div className="max-w-xl space-y-2">
              <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Ready to run your first AI mock interview?
              </h3>
              <p className="text-sm text-muted-foreground sm:text-base">
                Spin up a calibrated interview in under 60 seconds. No credit
                card required.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={handleStartClick}
                disabled={startLoading}
                className="w-full sm:w-auto"
              >
                Start Mock Interview
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Book an enterprise demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
