"use client";

import * as React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

// Branded color palette - professional and cohesive
const SECTION_COLORS = [
  { bg: "bg-primary", bgHex: "var(--primary)", light: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
  { bg: "bg-emerald-500", bgHex: "#10b981", light: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-500", bgHex: "#f59e0b", light: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-violet-500", bgHex: "#8b5cf6", light: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-600 dark:text-violet-400" },
  { bg: "bg-rose-500", bgHex: "#f43f5e", light: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-600 dark:text-rose-400" },
  { bg: "bg-cyan-500", bgHex: "#06b6d4", light: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-600 dark:text-cyan-400" },
];

export interface SectionData {
  name: string;
  weight: number;
  min_questions: number;
  max_questions: number;
  color?: string;
}

interface MultiRangeSliderProps {
  sections: SectionData[];
  onChange: (sections: SectionData[]) => void;
  onRemoveSection?: (index: number) => void;
  disabled?: boolean;
  className?: string;
  minSectionWeight?: number;
}

export function MultiRangeSlider({
  sections,
  onChange,
  disabled = false,
  className,
  minSectionWeight = 0.1,
}: MultiRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  // Calculate cumulative positions for handles
  const getCumulativePositions = useCallback(() => {
    const positions: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < sections.length - 1; i++) {
      cumulative += sections[i].weight;
      positions.push(cumulative * 100);
    }
    return positions;
  }, [sections]);

  const handlePositions = getCumulativePositions();

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number) => {
      if (dragging === null || !trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));

      const newSections = [...sections];
      
      const minPos = dragging === 0 
        ? minSectionWeight * 100 
        : handlePositions[dragging - 1] + minSectionWeight * 100;
      const maxPos = dragging === sections.length - 2 
        ? 100 - minSectionWeight * 100 
        : handlePositions[dragging + 1] - minSectionWeight * 100;

      const constrainedPercentage = Math.max(minPos, Math.min(maxPos, percentage));

      const prevCumulative = dragging === 0 ? 0 : handlePositions[dragging - 1];
      const newWeight = (constrainedPercentage - prevCumulative) / 100;
      const oldWeight = newSections[dragging].weight;
      const weightDiff = newWeight - oldWeight;

      newSections[dragging].weight = newWeight;
      newSections[dragging + 1].weight = newSections[dragging + 1].weight - weightDiff;

      const total = newSections.reduce((sum, s) => sum + s.weight, 0);
      if (Math.abs(total - 1) > 0.001) {
        newSections.forEach(s => {
          s.weight = s.weight / total;
        });
      }

      onChange(newSections);
    },
    [dragging, sections, onChange, handlePositions, minSectionWeight, disabled]
  );

  useEffect(() => {
    if (dragging === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
    };

    const handleMouseUp = () => setDragging(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMove]);

  useEffect(() => {
    if (dragging === null) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => setDragging(null);

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, handleMove]);

  return (
    <div className={cn("w-full select-none", className)}>
      {/* Section List - Compact Cards */}
      <div className="space-y-1.5 mb-4">
        {sections.map((section, index) => {
          const color = SECTION_COLORS[index % SECTION_COLORS.length];
          const isActive = activeSection === index;
          const percentage = Math.round(section.weight * 100);

          return (
            <div
              key={index}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200",
                isActive ? `${color.border} ${color.light}` : "border-border/40 hover:border-border/80",
                disabled && "opacity-60"
              )}
              onMouseEnter={() => !disabled && setActiveSection(index)}
              onMouseLeave={() => setActiveSection(null)}
            >
              {/* Color dot */}
              <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", color.bg)} />
              
              {/* Percentage */}
              <span className={cn("text-sm font-bold tabular-nums w-10", color.text)}>
                {percentage}%
              </span>

              {/* Section name */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground truncate block">{section.name}</span>
              </div>

              {/* Question count */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <MessageSquare className="h-3 w-3" />
                <span>{section.min_questions}–{section.max_questions}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Slider Track */}
      <div className="relative">
        <p className="text-[11px] text-muted-foreground mb-1.5">Drag dividers to adjust:</p>
        <div
          ref={trackRef}
          className={cn(
            "relative h-6 rounded-md overflow-hidden bg-muted/30 border border-border/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Colored segments */}
          {sections.map((section, index) => {
            const startPos = index === 0 ? 0 : handlePositions[index - 1];
            const width = section.weight * 100;
            const color = SECTION_COLORS[index % SECTION_COLORS.length];

            return (
              <div
                key={index}
                className={cn(
                  "absolute h-full flex items-center justify-center transition-all duration-100",
                  color.bg,
                  activeSection === index && "brightness-110 z-[1]",
                  disabled ? "cursor-not-allowed" : "cursor-pointer"
                )}
                style={{
                  left: `${startPos}%`,
                  width: `${width}%`,
                }}
                onMouseEnter={() => !disabled && setActiveSection(index)}
                onMouseLeave={() => setActiveSection(null)}
              />
            );
          })}

          {/* Draggable handles between segments */}
          {handlePositions.map((position, index) => (
            <div
              key={index}
              className={cn(
                "absolute top-0 bottom-0 w-5 -ml-2.5 z-20 group",
                disabled ? "cursor-not-allowed" : "cursor-ew-resize"
              )}
              style={{ left: `${position}%` }}
              onMouseDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                setDragging(index);
              }}
              onTouchStart={(e) => {
                if (disabled) return;
                e.preventDefault();
                setDragging(index);
              }}
            >
              {/* Handle visual - vertical line */}
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "w-0.5 h-4 rounded-full bg-white shadow-md",
                "transition-all duration-150",
                "group-hover:h-5 group-hover:w-1",
                dragging === index && "h-5 w-1.5 shadow-lg"
              )} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { SECTION_COLORS };
