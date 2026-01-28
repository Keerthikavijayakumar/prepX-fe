"use client";

import { memo, useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
  transcript: string[];
}

// Parse transcript entry
function parseTranscriptEntry(entry: string): { role: "interviewer" | "candidate" | "system"; content: string } {
  if (entry.includes("INTERVIEWER:")) {
    return { role: "interviewer", content: entry.replace("INTERVIEWER:", "").trim() };
  }
  if (entry.includes("CANDIDATE:") || entry.includes("You:")) {
    return { 
      role: "candidate", 
      content: entry.replace("CANDIDATE:", "").replace("You:", "").trim() 
    };
  }
  return { role: "system", content: entry };
}

// Individual message bubble
const TranscriptMessage = memo(function TranscriptMessage({ 
  entry,
  index
}: { 
  entry: string;
  index: number;
}) {
  const { role, content } = parseTranscriptEntry(entry);
  
  const isInterviewer = role === "interviewer";
  const isCandidate = role === "candidate";

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
        isCandidate && "flex-row-reverse"
      )}
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isInterviewer && "bg-primary/10",
        isCandidate && "bg-emerald-500/10",
        !isInterviewer && !isCandidate && "bg-muted/50"
      )}>
        {isInterviewer ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : isCandidate ? (
          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Message bubble */}
      <div className={cn(
        "flex-1 max-w-[85%] rounded-2xl px-4 py-3",
        isInterviewer && "bg-primary/5 rounded-tl-sm",
        isCandidate && "bg-emerald-500/5 rounded-tr-sm",
        !isInterviewer && !isCandidate && "bg-muted/30 rounded-tl-sm"
      )}>
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {isInterviewer ? "AI Interviewer" : isCandidate ? "You" : "System"}
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
});

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!transcript || transcript.length === 0) {
    return null;
  }

  return (
    <div 
      className="rounded-2xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: "400ms", animationFillMode: "backwards" }}
    >
      {/* Header - clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Interview Transcript</h3>
            <p className="text-xs text-muted-foreground">
              {transcript.length} messages in conversation
            </p>
          </div>
        </div>
        <div className={cn(
          "p-2 rounded-lg bg-muted/50 transition-transform duration-200",
          isExpanded && "rotate-180"
        )}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {/* Transcript content */}
      {isExpanded && (
        <div className="p-5 pt-0">
          <div className="h-px bg-border/50 my-4" />
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {transcript.map((entry, i) => (
              <TranscriptMessage key={i} entry={entry} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
