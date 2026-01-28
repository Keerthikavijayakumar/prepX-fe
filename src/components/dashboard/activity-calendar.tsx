"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyActivity } from "@/lib/statsClient";

interface ActivityCalendarProps {
  data: DailyActivity[];
  weeks?: number;
  loading?: boolean;
}

export function ActivityCalendar({ data, weeks = 12, loading }: ActivityCalendarProps) {
  const calendarData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);

    // Create a map of activity by date
    const activityMap = new Map(
      data.map((d) => [d.activity_date, d.interviews_completed])
    );

    // Generate all days
    const days: { date: string; count: number; dayOfWeek: number }[] = [];
    const current = new Date(startDate);

    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
        dayOfWeek: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }

    // Group by weeks
    const weekGroups: typeof days[] = [];
    let currentWeek: typeof days = [];

    // Pad the first week if it doesn't start on Sunday
    const firstDayOfWeek = days[0]?.dayOfWeek || 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: -1, dayOfWeek: i });
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }

    // Calculate stats
    const totalDays = days.filter((d) => d.count > 0).length;
    const totalInterviews = days.reduce((sum, d) => sum + Math.max(0, d.count), 0);

    return { weekGroups, totalDays, totalInterviews };
  }, [data, weeks]);

  const getIntensityClass = (count: number) => {
    if (count < 0) return "bg-transparent";
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
    if (count === 2) return "bg-emerald-400 dark:bg-emerald-700";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  if (loading) {
    return (
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Practice Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const { weekGroups, totalDays, totalInterviews } = calendarData;

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Practice Activity</CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalInterviews} interviews in {totalDays} days
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="flex gap-1 mb-1">
          <div className="w-6" /> {/* Spacer for day labels */}
          <div className="flex-1 flex justify-between text-[10px] text-muted-foreground px-0.5">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <span key={i} className="w-3 text-center">{day}</span>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1">
          {/* Week labels */}
          <div className="flex flex-col justify-around text-[10px] text-muted-foreground w-6">
            {weekGroups.length > 0 && (
              <>
                <span>{getMonthLabel(weekGroups[0]?.[0]?.date)}</span>
                {weekGroups.length > 4 && (
                  <span>{getMonthLabel(weekGroups[Math.floor(weekGroups.length / 2)]?.[0]?.date)}</span>
                )}
              </>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 flex gap-[2px] overflow-x-auto">
            {weekGroups.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[2px]">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm transition-colors ${getIntensityClass(day.count)}`}
                    title={day.date ? `${day.date}: ${day.count} interview${day.count !== 1 ? "s" : ""}` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-[2px]">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

function getMonthLabel(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short" });
}
