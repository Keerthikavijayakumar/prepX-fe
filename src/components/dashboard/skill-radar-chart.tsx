"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillScores } from "@/lib/statsClient";

interface SkillRadarChartProps {
  skills: SkillScores;
  loading?: boolean;
}

const SKILL_LABELS: Record<string, string> = {
  communication: "Communication",
  technical: "Technical",
  problem_solving: "Problem Solving",
};

export function SkillRadarChart({ skills, loading }: SkillRadarChartProps) {
  const skillData = useMemo(() => {
    const entries = Object.entries(skills).filter(
      ([_, value]) => value !== undefined && value !== null
    );
    
    if (entries.length === 0) return [];

    return entries.map(([key, value]) => ({
      name: SKILL_LABELS[key] || key,
      score: value as number,
      percentage: ((value as number) / 10) * 100,
    }));
  }, [skills]);

  if (loading) {
    return (
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Skill Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (skillData.length === 0) {
    return (
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Skill Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
            Complete interviews to see skill breakdown
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Skill Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skillData.map((skill) => (
            <div key={skill.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{skill.name}</span>
                <span className={`font-semibold ${getScoreTextColor(skill.score)}`}>
                  {skill.score.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getScoreColor(skill.score)}`}
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Average indicator */}
        {skillData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Average</span>
              <span className="font-semibold">
                {(skillData.reduce((sum, s) => sum + s.score, 0) / skillData.length).toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
