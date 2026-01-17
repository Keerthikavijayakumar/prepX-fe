"use client";

import { memo } from "react";
import { 
  CheckCircle2, 
  Target, 
  Lightbulb, 
  TrendingUp,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDetails {
  strengths?: string[];
  weaknesses?: string[];
}

interface FeedbackCardsProps {
  feedbackDetails: FeedbackDetails;
  summary?: string;
}

// Individual feedback item
const FeedbackItem = memo(function FeedbackItem({ 
  text, 
  type,
  index
}: { 
  text: string; 
  type: "strength" | "improvement";
  index: number;
}) {
  const isStrength = type === "strength";
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        isStrength 
          ? "bg-emerald-500/5 hover:bg-emerald-500/10" 
          : "bg-amber-500/5 hover:bg-amber-500/10",
        "animate-in fade-in slide-in-from-left-2"
      )}
      style={{ animationDelay: `${index * 75}ms`, animationFillMode: "backwards" }}
    >
      <div className={cn(
        "flex-shrink-0 p-1.5 rounded-lg",
        isStrength ? "bg-emerald-500/20" : "bg-amber-500/20"
      )}>
        {isStrength ? (
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  );
});

// Strengths card
export const StrengthsCard = memo(function StrengthsCard({ 
  strengths 
}: { 
  strengths: string[] 
}) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div 
      className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent p-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">What You Did Well</h3>
          <p className="text-xs text-muted-foreground">{strengths.length} strengths identified</p>
        </div>
      </div>
      <div className="space-y-2">
        {strengths.map((strength, i) => (
          <FeedbackItem key={i} text={strength} type="strength" index={i} />
        ))}
      </div>
    </div>
  );
});

// Improvements card
export const ImprovementsCard = memo(function ImprovementsCard({ 
  improvements 
}: { 
  improvements: string[] 
}) {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div 
      className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent p-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Areas to Improve</h3>
          <p className="text-xs text-muted-foreground">{improvements.length} suggestions</p>
        </div>
      </div>
      <div className="space-y-2">
        {improvements.map((improvement, i) => (
          <FeedbackItem key={i} text={improvement} type="improvement" index={i} />
        ))}
      </div>
    </div>
  );
});

// Summary card
export const SummaryCard = memo(function SummaryCard({ 
  summary 
}: { 
  summary?: string 
}) {
  if (!summary) {
    return (
      <div 
        className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/30 via-transparent to-transparent p-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-muted/50">
            <AlertCircle className="h-5 w-5 text-muted-foreground animate-pulse" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Generating your personalized feedback...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">Overall Assessment</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
});

// Combined feedback section
export function FeedbackCards({ feedbackDetails, summary }: FeedbackCardsProps) {
  const { strengths = [], weaknesses = [] } = feedbackDetails;
  const hasStrengths = strengths.length > 0;
  const hasWeaknesses = weaknesses.length > 0;

  return (
    <div className="space-y-6">
      <SummaryCard summary={summary} />
      
      {(hasStrengths || hasWeaknesses) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {hasStrengths && <StrengthsCard strengths={strengths} />}
          {hasWeaknesses && <ImprovementsCard improvements={weaknesses} />}
        </div>
      )}
    </div>
  );
}
