"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/statsClient";

interface AchievementCardProps {
  achievement: Achievement;
  size?: "sm" | "md";
}

export function AchievementCard({ achievement, size = "md" }: AchievementCardProps) {
  const isEarned = achievement.earned_at !== null;
  
  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: "text-2xl",
      title: "text-xs",
      desc: "text-[10px]",
      points: "text-[10px]",
    },
    md: {
      container: "p-4",
      icon: "text-3xl",
      title: "text-sm",
      desc: "text-xs",
      points: "text-xs",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all animate-in fade-in zoom-in-95 duration-300",
        classes.container,
        isEarned
          ? "bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/30 dark:border-primary/20 hover:scale-[1.02]"
          : "bg-muted/30 border-border/50 opacity-60"
      )}
    >
      {/* Lock overlay for unearned */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${classes.icon} ${!isEarned && "grayscale"}`}>
          {achievement.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold truncate ${classes.title} ${
            isEarned ? "text-foreground" : "text-muted-foreground"
          }`}>
            {achievement.name}
          </h4>
          <p className={`text-muted-foreground line-clamp-2 mt-0.5 ${classes.desc}`}>
            {achievement.description}
          </p>
          
          {/* Points badge */}
          <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${classes.points} ${
            isEarned
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            <span className="font-medium">{achievement.points}</span>
            <span>pts</span>
          </div>
        </div>
      </div>

      {/* Earned date */}
      {isEarned && achievement.earned_at && (
        <div className={`absolute top-2 right-2 ${classes.points} text-muted-foreground`}>
          {new Date(achievement.earned_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      )}
    </div>
  );
}

interface AchievementsGridProps {
  achievements: Achievement[];
  maxDisplay?: number;
  showAll?: boolean;
}

export function AchievementsGrid({ 
  achievements, 
  maxDisplay = 6,
  showAll = false 
}: AchievementsGridProps) {
  const displayAchievements = showAll 
    ? achievements 
    : achievements.slice(0, maxDisplay);

  const earnedCount = achievements.filter(a => a.earned_at !== null).length;
  const totalPoints = achievements
    .filter(a => a.earned_at !== null)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Achievements</h3>
          <p className="text-xs text-muted-foreground">
            {earnedCount} of {achievements.length} unlocked • {totalPoints} pts
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayAchievements.map((achievement) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
            size="sm"
          />
        ))}
      </div>

      {/* Show more indicator */}
      {!showAll && achievements.length > maxDisplay && (
        <p className="text-xs text-center text-muted-foreground">
          +{achievements.length - maxDisplay} more achievements
        </p>
      )}
    </div>
  );
}
