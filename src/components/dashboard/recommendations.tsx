"use client";

import { Lightbulb, TrendingUp, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserStats } from "@/lib/statsClient";

interface Recommendation {
  type: "streak" | "improvement" | "practice" | "difficulty";
  title: string;
  description: string;
  icon: React.ElementType;
  priority: "high" | "medium" | "low";
}

interface RecommendationsProps {
  stats: UserStats;
  onStartInterview?: () => void;
}

export function Recommendations({ stats, onStartInterview }: RecommendationsProps) {
  const recommendations: Recommendation[] = [];

  // Streak at risk
  if (stats.streak_at_risk && stats.current_streak > 0) {
    recommendations.push({
      type: "streak",
      title: "Keep your streak alive!",
      description: `Practice today to maintain your ${stats.current_streak}-day streak.`,
      icon: Flame,
      priority: "high",
    });
  }

  // No interviews yet
  if (stats.total_interviews === 0) {
    recommendations.push({
      type: "practice",
      title: "Start your first interview",
      description: "Complete your first mock interview to begin tracking progress.",
      icon: Target,
      priority: "high",
    });
  }

  // Low score improvement suggestion
  if (stats.avg_score !== null && stats.avg_score < 7 && stats.total_interviews >= 3) {
    recommendations.push({
      type: "improvement",
      title: "Focus on fundamentals",
      description: "Practice more to improve your average score.",
      icon: TrendingUp,
      priority: "medium",
    });
  }

  // Ready for harder difficulty
  if (stats.avg_score !== null && stats.avg_score >= 7.5 && stats.total_interviews >= 5) {
    recommendations.push({
      type: "difficulty",
      title: "Ready for a challenge?",
      description: "Your scores suggest you're ready for advanced difficulty.",
      icon: Target,
      priority: "medium",
    });
  }

  // No recent practice
  if (stats.last_practice_date && stats.current_streak === 0 && stats.total_interviews > 0) {
    const lastPractice = new Date(stats.last_practice_date);
    const daysSince = Math.floor((Date.now() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince >= 3) {
      recommendations.push({
        type: "practice",
        title: "Time to practice!",
        description: `It's been ${daysSince} days since your last interview.`,
        icon: Lightbulb,
        priority: "medium",
      });
    }
  }

  // No recommendations
  if (recommendations.length === 0) {
    return null;
  }

  // Show only the highest priority recommendation
  const topRecommendation = recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  })[0];

  const Icon = topRecommendation.icon;
  const isHighPriority = topRecommendation.priority === "high";

  return (
    <div className={`rounded-xl p-4 border ${
      isHighPriority
        ? "bg-gradient-to-r from-primary/10 to-emerald-500/10 border-primary/20"
        : "bg-muted/50 border-border/50"
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isHighPriority ? "bg-primary/20" : "bg-muted"
          }`}>
            <Icon className={`h-5 w-5 ${
              isHighPriority ? "text-primary" : "text-muted-foreground"
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{topRecommendation.title}</h3>
            <p className="text-xs text-muted-foreground">{topRecommendation.description}</p>
          </div>
        </div>
        {onStartInterview && (
          <Button size="sm" variant={isHighPriority ? "default" : "outline"} onClick={onStartInterview}>
            Practice Now
          </Button>
        )}
      </div>
    </div>
  );
}
