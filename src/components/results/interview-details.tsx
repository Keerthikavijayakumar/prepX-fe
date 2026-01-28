"use client";

import { memo } from "react";
import { 
  Briefcase, 
  Building2, 
  Clock, 
  Calendar, 
  BarChart3,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewDetailsProps {
  targetRole?: string;
  targetCompany?: string;
  complexity: string;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
}

// Detail item component
const DetailItem = memo(function DetailItem({
  icon: Icon,
  label,
  value,
  iconColor = "text-primary"
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="p-2 rounded-lg bg-muted/50">
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground truncate">
          {value}
        </div>
      </div>
    </div>
  );
});

// Complexity badge
function ComplexityBadge({ complexity }: { complexity: string }) {
  const config = {
    beginner: { 
      bg: "bg-green-500/10 border-green-500/20", 
      text: "text-green-600 dark:text-green-400",
      label: "Beginner"
    },
    intermediate: { 
      bg: "bg-blue-500/10 border-blue-500/20", 
      text: "text-blue-600 dark:text-blue-400",
      label: "Intermediate"
    },
    advanced: { 
      bg: "bg-purple-500/10 border-purple-500/20", 
      text: "text-purple-600 dark:text-purple-400",
      label: "Advanced"
    },
  }[complexity] || { 
    bg: "bg-muted/50", 
    text: "text-muted-foreground",
    label: complexity 
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      config.bg,
      config.text
    )}>
      {config.label}
    </span>
  );
}

export function InterviewDetails({
  targetRole,
  targetCompany,
  complexity,
  durationMinutes,
  startedAt,
  endedAt
}: InterviewDetailsProps) {
  // Calculate actual duration if ended
  const actualDuration = endedAt 
    ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000)
    : null;

  const formattedDate = new Date(startedAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formattedTime = new Date(startedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return (
    <div 
      className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/20 via-transparent to-transparent p-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
    >
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        Interview Details
      </h3>

      <div className="grid gap-1 sm:grid-cols-2">
        <DetailItem
          icon={Briefcase}
          label="Target Role"
          value={targetRole || "General Practice"}
          iconColor="text-blue-500"
        />
        
        {targetCompany && (
          <DetailItem
            icon={Building2}
            label="Company"
            value={targetCompany}
            iconColor="text-purple-500"
          />
        )}

        <DetailItem
          icon={BarChart3}
          label="Complexity"
          value={<ComplexityBadge complexity={complexity} />}
          iconColor="text-amber-500"
        />

        <DetailItem
          icon={Clock}
          label="Scheduled Duration"
          value={`${durationMinutes} minutes`}
          iconColor="text-emerald-500"
        />

        {actualDuration && (
          <DetailItem
            icon={Timer}
            label="Actual Duration"
            value={`${actualDuration} minutes`}
            iconColor="text-cyan-500"
          />
        )}

        <DetailItem
          icon={Calendar}
          label="Date & Time"
          value={`${formattedDate} at ${formattedTime}`}
          iconColor="text-pink-500"
        />
      </div>
    </div>
  );
}
