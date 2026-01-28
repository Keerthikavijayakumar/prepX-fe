"use client";

import { Clock, Briefcase, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewHistoryItem } from "@/lib/interviewClient";

interface InterviewHistoryCardProps {
  interview: InterviewHistoryItem;
  index: number;
  onClick: () => void;
}

// Score display with visual indicator
function ScoreIndicator({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</span>
      </div>
    );
  }

  const getScoreConfig = (s: number) => {
    if (s >= 8) return { 
      bg: "bg-emerald-100 dark:bg-emerald-900/30", 
      text: "text-emerald-700 dark:text-emerald-400",
      ring: "ring-emerald-500/30",
      label: "Excellent"
    };
    if (s >= 6) return { 
      bg: "bg-blue-100 dark:bg-blue-900/30", 
      text: "text-blue-700 dark:text-blue-400",
      ring: "ring-blue-500/30",
      label: "Good"
    };
    if (s >= 4) return { 
      bg: "bg-amber-100 dark:bg-amber-900/30", 
      text: "text-amber-700 dark:text-amber-400",
      ring: "ring-amber-500/30",
      label: "Fair"
    };
    return { 
      bg: "bg-red-100 dark:bg-red-900/30", 
      text: "text-red-700 dark:text-red-400",
      ring: "ring-red-500/30",
      label: "Needs Work"
    };
  };

  const config = getScoreConfig(score);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full ring-1",
      config.bg,
      config.ring
    )}>
      <span className={cn("text-lg font-bold", config.text)}>
        {score.toFixed(1)}
      </span>
      <span className={cn("text-xs font-medium", config.text)}>
        /10
      </span>
    </div>
  );
}

// Complexity badge with styled appearance
function ComplexityBadge({ complexity }: { complexity: string }) {
  const config = {
    beginner: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Beginner" },
    intermediate: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Intermediate" },
    advanced: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", label: "Advanced" },
  }[complexity] || { bg: "bg-slate-100", text: "text-slate-600", label: complexity };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-xs font-medium",
      config.bg,
      config.text
    )}>
      {config.label}
    </span>
  );
}

export function InterviewHistoryCard({ interview, index, onClick }: InterviewHistoryCardProps) {
  const score = interview.score_overall;
  const hasScore = score !== null && score !== undefined;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl p-4",
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800",
        "hover:border-primary/50 dark:hover:border-primary/50",
        "hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300 cursor-pointer",
        "animate-in fade-in slide-in-from-bottom-2"
      )}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {interview.target_role || "Practice Interview"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(interview.started_at).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </p>
          </div>
          <ScoreIndicator score={score} />
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ComplexityBadge complexity={interview.complexity} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {interview.duration_minutes} min
          </span>
          {interview.target_company && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{interview.target_company}</span>
            </span>
          )}
        </div>

        {/* Feedback preview */}
        {interview.feedback_summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {interview.feedback_summary}
          </p>
        )}

        {/* Footer action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-muted-foreground">
            {hasScore ? "View detailed feedback" : "Evaluation in progress..."}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

// Interview history grid component
interface InterviewHistoryGridProps {
  interviews: InterviewHistoryItem[];
  loading?: boolean;
  onInterviewClick: (id: string) => void;
}

export function InterviewHistoryGrid({ interviews, loading, onInterviewClick }: InterviewHistoryGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="h-8 w-16 bg-muted rounded-full" />
            </div>
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-20 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
            <div className="h-8 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No interviews yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Start your first practice interview to begin building your skills and tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {interviews.map((interview, index) => (
        <InterviewHistoryCard
          key={interview.id}
          interview={interview}
          index={index}
          onClick={() => onInterviewClick(interview.id)}
        />
      ))}
    </div>
  );
}
