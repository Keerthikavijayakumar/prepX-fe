"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreTrendPoint } from "@/lib/statsClient";

interface ScoreTrendChartProps {
  data: ScoreTrendPoint[];
  loading?: boolean;
}

export function ScoreTrendChart({ data, loading }: ScoreTrendChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { points: [], min: 0, max: 10, trend: 0 };

    const scores = data.map((d) => d.score);
    const min = Math.max(0, Math.floor(Math.min(...scores) - 1));
    const max = Math.min(10, Math.ceil(Math.max(...scores) + 1));
    
    // Calculate trend (compare last 3 vs first 3)
    let trend = 0;
    if (data.length >= 4) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      trend = secondAvg - firstAvg;
    }

    // Normalize points for SVG (0-100 scale)
    const range = max - min || 1;
    const points = data.map((d, i) => ({
      x: (i / Math.max(data.length - 1, 1)) * 100,
      y: 100 - ((d.score - min) / range) * 100,
      score: d.score,
      date: d.date,
    }));

    return { points, min, max, trend };
  }, [data]);

  if (loading) {
    return (
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[160px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (data.length < 2) {
    return (
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
            Complete more interviews to see your trend
          </div>
        </CardContent>
      </Card>
    );
  }

  const { points, min, max, trend } = chartData;
  
  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Create area path (for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1].x} 100 L 0 100 Z`;

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend > 0 ? "text-emerald-600" : "text-red-500"
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[160px]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-muted-foreground">
            <span>{max}</span>
            <span>{((max + min) / 2).toFixed(1)}</span>
            <span>{min}</span>
          </div>

          {/* Chart area */}
          <div className="ml-10 h-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* Grid lines */}
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" />
              
              {/* Area fill */}
              <path
                d={areaD}
                fill="url(#gradient)"
                opacity="0.2"
              />
              
              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="var(--primary)"
                  className="hover:r-4 transition-all"
                />
              ))}
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="ml-10 flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{data[0]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
