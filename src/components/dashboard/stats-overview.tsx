"use client";

import { Target, Flame, BarChart3, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPracticeTime, getScoreColor } from "@/lib/statsClient";
import type { UserStats } from "@/lib/statsClient";

interface StatsOverviewProps {
  stats: UserStats;
  loading?: boolean;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: number;
  highlight?: boolean;
  iconColor?: string;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  suffix, 
  trend, 
  highlight,
  iconColor = "text-primary"
}: StatCardProps) {
  return (
    <Card className={`border transition-all ${
      highlight 
        ? "border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30" 
        : "border-border/50 hover:border-border"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${
            highlight 
              ? "bg-amber-100 dark:bg-amber-900/50" 
              : "bg-muted"
          }`}>
            <Icon className={`h-4 w-4 ${highlight ? "text-amber-600 dark:text-amber-400" : iconColor}`} />
          </div>
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center text-xs font-medium ${
              trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              )}
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${
              highlight ? "text-amber-700 dark:text-amber-300" : "text-foreground"
            }`}>
              {value}
            </span>
            {suffix && (
              <span className="text-sm text-muted-foreground">{suffix}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-border/50">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="space-y-2">
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const avgScoreDisplay = stats.avg_score !== null 
    ? stats.avg_score.toFixed(1) 
    : "—";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={Target}
        label="Avg Score"
        value={avgScoreDisplay}
        suffix={stats.avg_score !== null ? "/10" : ""}
        trend={stats.score_improvement}
        iconColor={getScoreColor(stats.avg_score)}
      />
      <StatCard
        icon={Flame}
        label="Current Streak"
        value={stats.current_streak}
        suffix={stats.current_streak === 1 ? "day" : "days"}
        highlight={stats.current_streak >= 3}
      />
      <StatCard
        icon={BarChart3}
        label="Interviews"
        value={stats.total_interviews}
      />
      <StatCard
        icon={Clock}
        label="Practice Time"
        value={formatPracticeTime(stats.total_practice_time_seconds)}
      />
    </div>
  );
}
