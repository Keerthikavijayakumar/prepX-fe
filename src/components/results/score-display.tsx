"use client";

import { memo, useEffect, useState } from "react";
import { Star, Trophy, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number | null | undefined;
  isLoading?: boolean;
}

// Animated circular score ring
const ScoreRing = memo(function ScoreRing({ 
  score, 
  size = 200 
}: { 
  score: number; 
  size?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(score / 10, 1);
  const offset = circumference - progress * circumference;

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const getScoreColor = (s: number) => {
    if (s >= 8) return { stroke: "stroke-emerald-500", bg: "text-emerald-500" };
    if (s >= 6) return { stroke: "stroke-blue-500", bg: "text-blue-500" };
    if (s >= 4) return { stroke: "stroke-amber-500", bg: "text-amber-500" };
    return { stroke: "stroke-red-500", bg: "text-red-500" };
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={`Score: ${score} out of 10`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted/20"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn(
            "fill-none transition-[stroke-dashoffset] duration-1000 ease-out",
            colors.stroke
          )}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: mounted ? offset : circumference,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-6xl font-bold tabular-nums", colors.bg)}>
          {score.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground font-medium">out of 10</span>
      </div>
    </div>
  );
});

// Score label badge
function ScoreLabel({ score }: { score: number }) {
  const getConfig = (s: number) => {
    if (s >= 8) return { 
      label: "Excellent Performance", 
      icon: Trophy,
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400"
    };
    if (s >= 6) return { 
      label: "Great Job!", 
      icon: Award,
      bg: "bg-blue-500/10 border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400"
    };
    if (s >= 4) return { 
      label: "Good Effort", 
      icon: Star,
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400"
    };
    return { 
      label: "Keep Practicing", 
      icon: TrendingUp,
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-600 dark:text-red-400"
    };
  };

  const config = getConfig(score);
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-full border",
      config.bg
    )}>
      <Icon className={cn("h-4 w-4", config.text)} />
      <span className={cn("text-sm font-semibold", config.text)}>
        {config.label}
      </span>
    </div>
  );
}

// Loading state
function ScoreLoading() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-[200px] h-[200px]">
        {/* Animated loading ring */}
        <div className="absolute inset-0 rounded-full border-[12px] border-muted/20" />
        <div 
          className="absolute inset-0 rounded-full border-[12px] border-transparent border-t-primary animate-spin"
          style={{ animationDuration: "1.5s" }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="h-12 w-20 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted/30 rounded mt-2 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Analyzing your performance...
        </p>
        <p className="text-xs text-muted-foreground/70">
          This usually takes 10-30 seconds
        </p>
      </div>
    </div>
  );
}

export function ScoreDisplay({ score, isLoading }: ScoreDisplayProps) {
  const hasScore = score !== null && score !== undefined;

  if (isLoading || !hasScore) {
    return <ScoreLoading />;
  }

  return (
    <div 
      className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500"
    >
      <ScoreRing score={score} />
      <ScoreLabel score={score} />
    </div>
  );
}
