"use client";

import { memo, useEffect, useState } from "react";
import { Target, Flame, BarChart3, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserStats } from "@/lib/statsClient";

interface StatsCardsProps {
  stats: UserStats;
  loading?: boolean;
}

// Optimized circular progress ring with CSS transitions
const CircularProgress = memo(function CircularProgress({ 
  value, 
  max, 
  size = 48, 
  strokeWidth = 4,
  color = "stroke-primary",
  label
}: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  label: string;
}) {
  const [mounted, setMounted] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <svg 
      width={size} 
      height={size} 
      className="transform -rotate-90"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        className="fill-none stroke-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        className={cn("fill-none transition-[stroke-dashoffset] duration-700 ease-out", color)}
        strokeLinecap="round"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: mounted ? offset : circumference,
        }}
      />
    </svg>
  );
});

// Format practice time
function formatTime(seconds: number): { value: string; unit: string } {
  if (seconds < 60) return { value: `${seconds}`, unit: "sec" };
  if (seconds < 3600) return { value: `${Math.round(seconds / 60)}`, unit: "min" };
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return { value: `${hours}h ${mins}m`, unit: "" };
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-5 animate-pulse">
            <div className="h-16 w-16 rounded-full bg-muted/50 mb-3" />
            <div className="h-8 w-20 bg-muted/50 rounded mb-2" />
            <div className="h-4 w-24 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const avgScore = stats.avg_score ?? 0;
  const scorePercent = (avgScore / 10) * 100;
  const practiceTime = formatTime(stats.total_practice_time_seconds);

  const cards = [
    {
      id: "score",
      icon: Target,
      label: "Average Score",
      value: avgScore.toFixed(1),
      suffix: "/10",
      gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-500",
      ringColor: "stroke-violet-500",
      progress: { value: avgScore, max: 10 },
      trend: stats.score_improvement,
    },
    {
      id: "streak",
      icon: Flame,
      label: "Current Streak",
      value: stats.current_streak.toString(),
      suffix: stats.current_streak === 1 ? " day" : " days",
      gradient: stats.current_streak >= 3 
        ? "from-orange-500/20 via-amber-500/15 to-yellow-500/20" 
        : "from-slate-500/10 via-slate-400/5 to-slate-500/10",
      iconBg: stats.current_streak >= 3 ? "bg-orange-500/20" : "bg-slate-500/20",
      iconColor: stats.current_streak >= 3 ? "text-orange-500" : "text-slate-500",
      ringColor: stats.current_streak >= 3 ? "stroke-orange-500" : "stroke-slate-400",
      progress: { value: Math.min(stats.current_streak, 7), max: 7 },
      showFire: stats.current_streak >= 3,
    },
    {
      id: "interviews",
      icon: BarChart3,
      label: "Total Interviews",
      value: stats.total_interviews.toString(),
      suffix: "",
      gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
      ringColor: "stroke-emerald-500",
      progress: { value: Math.min(stats.total_interviews, 20), max: 20 },
    },
    {
      id: "time",
      icon: Clock,
      label: "Practice Time",
      value: practiceTime.value,
      suffix: practiceTime.unit,
      gradient: "from-blue-500/20 via-cyan-500/10 to-sky-500/20",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
      ringColor: "stroke-blue-500",
      progress: { value: Math.min(stats.total_practice_time_seconds / 60, 120), max: 120 },
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={cn(
            "relative overflow-hidden rounded-2xl p-5",
            "bg-gradient-to-br",
            card.gradient,
            "border border-white/10 dark:border-white/5",
            "hover:scale-[1.02] transition-all duration-300 ease-out",
            "group cursor-default",
            "animate-in fade-in slide-in-from-bottom-4",
          )}
          style={{ animationDelay: `${index * 75}ms`, animationFillMode: "backwards" }}
        >
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "p-2.5 rounded-xl",
                card.iconBg,
                "transition-transform duration-300 group-hover:scale-110"
              )}>
                <card.icon className={cn("h-5 w-5", card.iconColor)} />
              </div>
              
              {/* Progress ring */}
              <div className="relative">
                <CircularProgress 
                  value={card.progress.value} 
                  max={card.progress.max}
                  size={48}
                  strokeWidth={4}
                  color={card.ringColor}
                  label={card.label}
                />
                {card.showFire && (
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <span className="text-lg">🔥</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-sm text-muted-foreground font-medium">
                    {card.suffix}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {card.label}
              </p>
              
              {/* Trend indicator */}
              {card.trend !== undefined && card.trend !== 0 && (
                <div 
                  className={cn(
                    "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium",
                    card.trend > 0 
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-red-500/20 text-red-600 dark:text-red-400"
                  )}
                >
                  <TrendingUp className={cn(
                    "h-3 w-3",
                    card.trend < 0 && "rotate-180"
                  )} />
                  {card.trend > 0 ? "+" : ""}{card.trend.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
