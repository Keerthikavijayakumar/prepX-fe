"use client";

import { Flame, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  streakAtRisk: boolean;
  lastPracticeDate: string | null;
}

export function StreakBanner({ 
  currentStreak, 
  longestStreak, 
  streakAtRisk,
}: StreakBannerProps) {
  // Don't show banner if no streak
  if (currentStreak === 0 && !streakAtRisk) {
    return null;
  }

  const isNewRecord = currentStreak > 0 && currentStreak === longestStreak && currentStreak >= 3;

  if (streakAtRisk) {
    return (
      <div
        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/50 dark:border-amber-700/50 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div
                className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full animate-pulse"
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-amber-800 dark:text-amber-200">
                Your {currentStreak}-day streak is at risk!
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Practice today to keep your streak alive
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Flame className="h-5 w-5" />
            <span className="text-xl font-bold">{currentStreak}</span>
          </div>
        </div>
      </div>
    );
  }

  if (currentStreak >= 3) {
    return (
      <div
        className={cn(
          "bg-gradient-to-r border rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300",
          isNewRecord
            ? "from-emerald-500/10 to-teal-500/10 border-emerald-300/50 dark:border-emerald-700/50"
            : "from-orange-500/10 to-amber-500/10 border-orange-300/50 dark:border-orange-700/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  isNewRecord 
                    ? "bg-emerald-100 dark:bg-emerald-900/50" 
                    : "bg-orange-100 dark:bg-orange-900/50"
                )}
              >
                <Flame className={cn(
                  "h-5 w-5",
                  isNewRecord 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-orange-600 dark:text-orange-400"
                )} />
              </div>
            </div>
            <div>
              <h3 className={cn(
                "font-semibold text-sm",
                isNewRecord 
                  ? "text-emerald-800 dark:text-emerald-200" 
                  : "text-orange-800 dark:text-orange-200"
              )}>
                {isNewRecord ? "New personal record!" : "You're on fire!"}
              </h3>
              <p className={cn(
                "text-xs",
                isNewRecord 
                  ? "text-emerald-700/80 dark:text-emerald-300/80" 
                  : "text-orange-700/80 dark:text-orange-300/80"
              )}>
                {currentStreak} day streak • Best: {longestStreak} days
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1.5",
            isNewRecord 
              ? "text-emerald-600 dark:text-emerald-400" 
              : "text-orange-600 dark:text-orange-400"
          )}>
            <Flame className="h-6 w-6" />
            <span className="text-2xl font-bold">{currentStreak}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
