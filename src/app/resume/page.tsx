"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function ResumeWorkspacePage() {
  const router = useRouter();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Workspace
            </span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
              Resume workspace
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)] xl:grid-cols-[minmax(0,2.4fr)_minmax(280px,1fr)]">
          <section className="flex flex-col gap-4">
            <div className="border-t border-border/60 pt-4 sm:pt-5">
              <ResumeIntake />
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <Card className="bg-muted/60">
              <CardContent className="py-4 sm:py-5">
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    How this workspace works
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Upload once, edit as many times as you like. We keep a
                    structured view of your experience so other parts of the
                    product can stay in sync.
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    <li>• Start with a PDF or document up to 5MB.</li>
                    <li>• Review and adjust the parsed fields before saving.</li>
                    <li>• Changes are stored securely and can be updated later.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
