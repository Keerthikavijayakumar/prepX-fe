"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  Calendar,
  Timer,
} from "lucide-react";
import { interviewApi, type InterviewHistoryItem } from "@/lib/interviewClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds?: number, minutes?: number): string {
  if (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  if (minutes) {
    return `${minutes} min`;
  }
  return "—";
}

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      };
    case "failed":
      return {
        label: "Failed",
        icon: XCircle,
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      };
    case "timeout":
      return {
        label: "Timed Out",
        icon: AlertTriangle,
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      };
    default:
      return {
        label: status,
        icon: Clock,
        className: "bg-muted text-muted-foreground",
      };
  }
}

function getComplexityConfig(complexity: string) {
  switch (complexity) {
    case "beginner":
      return { label: "Beginner", className: "bg-blue-500/10 text-blue-600" };
    case "intermediate":
      return { label: "Intermediate", className: "bg-purple-500/10 text-purple-600" };
    case "advanced":
      return { label: "Advanced", className: "bg-orange-500/10 text-orange-600" };
    default:
      return { label: complexity, className: "bg-muted text-muted-foreground" };
  }
}

function InterviewCard({ interview }: { interview: InterviewHistoryItem }) {
  const router = useRouter();
  const statusConfig = getStatusConfig(interview.status);
  const complexityConfig = getComplexityConfig(interview.complexity);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={() => router.push(`/interview/${interview.id}/results`)}
      className="group relative bg-card border border-border/50 rounded-xl p-5 hover:border-border hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("text-xs", statusConfig.className)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", complexityConfig.className)}>
              {complexityConfig.label}
            </Badge>
          </div>

          <h3 className="font-semibold text-foreground truncate mb-1">
            {interview.target_role || "Interview Session"}
          </h3>

          {interview.target_company && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
              <Building2 className="w-3.5 h-3.5" />
              {interview.target_company}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(interview.started_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(interview.started_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              {formatDuration(interview.actual_duration_seconds, interview.duration_minutes)}
            </span>
          </div>
        </div>

        <div className="text-right">
          {interview.score_overall !== null && interview.score_overall !== undefined ? (
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-foreground">
                {Math.round(interview.score_overall)}
              </span>
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No score</span>
          )}
        </div>
      </div>

      {interview.feedback_summary && (
        <p className="mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground line-clamp-2">
          {interview.feedback_summary}
        </p>
      )}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card border border-border/50 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InterviewHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentStatus = searchParams.get("status") || "all";

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const status = currentStatus === "all" ? undefined : currentStatus;
      const result = await interviewApi.getHistoryPaginated(currentPage, ITEMS_PER_PAGE, status);
      setInterviews(result.interviews);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentStatus]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const updateFilters = (page: number, status: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (status !== "all") params.set("status", status);
    const queryString = params.toString();
    router.push(`/history${queryString ? `?${queryString}` : ""}`);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters(newPage, currentStatus);
  };

  const handleStatusChange = (newStatus: string) => {
    updateFilters(1, newStatus);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Interview History</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? "Loading..." : `${total} interview${total !== 1 ? "s" : ""} total`}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="timeout">Timed Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Interview List */}
          {loading ? (
            <HistorySkeleton />
          ) : interviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No interviews found</h3>
              <p className="text-muted-foreground mb-6">
                {currentStatus !== "all"
                  ? "Try changing the filter to see more interviews."
                  : "Start your first interview to see your history here."}
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "ghost"}
                      size="sm"
                      className="w-9"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
