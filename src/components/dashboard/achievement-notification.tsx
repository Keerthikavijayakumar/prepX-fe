"use client";

import { useEffect } from "react";
import { X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/lib/statsClient";

interface AchievementNotificationProps {
  achievements: Achievement[];
  onDismiss: (achievementIds: string[]) => void;
}

export function AchievementNotification({ 
  achievements, 
  onDismiss 
}: AchievementNotificationProps) {
  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (achievements.length === 0) return;

    const timer = setTimeout(() => {
      onDismiss(achievements.map(a => a.id));
    }, 10000);

    return () => clearTimeout(timer);
  }, [achievements, onDismiss]);

  if (achievements.length === 0) return null;

  const handleDismiss = () => {
    onDismiss(achievements.map(a => a.id));
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-right-12 duration-500"
    >
      <div className="bg-gradient-to-br from-primary via-primary to-emerald-600 rounded-2xl p-1 shadow-2xl shadow-primary/30">
        <div className="bg-gradient-to-br from-primary/95 to-emerald-600/95 rounded-xl p-4 backdrop-blur">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                  Achievement{achievements.length > 1 ? "s" : ""} Unlocked!
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 bg-white/10 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
              >
                <span className="text-3xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-white/70 line-clamp-1">
                    {achievement.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">
                    +{achievement.points}
                  </span>
                  <p className="text-[10px] text-white/60">pts</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total points */}
          {achievements.length > 1 && (
            <div className="mt-3 pt-3 border-t border-white/20 text-center">
              <span className="text-sm text-white/80">
                Total: <span className="font-bold text-white">
                  +{achievements.reduce((sum, a) => sum + a.points, 0)} pts
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
