import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// Types
// ============================================================================

export interface UserStats {
  total_interviews: number;
  total_practice_time_seconds: number;
  avg_score: number | null;
  best_score: number | null;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  skill_scores: SkillScores;
  score_improvement: number;
  streak_at_risk: boolean;
}

export interface SkillScores {
  communication?: number;
  technical?: number;
  problem_solving?: number;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "streak" | "performance" | "improvement" | "special";
  points: number;
  earned_at: string | null;
  notified: boolean;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
  interview_id?: string;
}

export interface DailyActivity {
  activity_date: string;
  interviews_completed: number;
  total_time_seconds: number;
  avg_score_today: number | null;
}

export interface DashboardStatsResponse {
  stats: UserStats;
  recent_achievements: Achievement[];
  unnotified_achievements: Achievement[];
  total_achievement_points: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

// ============================================================================
// Stats API Client
// ============================================================================

export const statsApi = {
  /**
   * Get dashboard stats including user stats, achievements, and points
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/stats/dashboard`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch dashboard stats");
    }

    return result.data;
  },

  /**
   * Get all achievements with earned status
   */
  async getAchievements(): Promise<{
    achievements: Achievement[];
    earned_count: number;
    total_count: number;
    total_points: number;
  }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/stats/achievements`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch achievements");
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch achievements");
    }

    return result.data;
  },

  /**
   * Get score trend data for charts
   */
  async getScoreTrend(days: number = 30): Promise<ScoreTrendPoint[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/stats/score-trend?days=${days}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch score trend");
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch score trend");
    }

    return result.data.trend;
  },

  /**
   * Get activity calendar data
   */
  async getActivityCalendar(weeks: number = 12): Promise<DailyActivity[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/stats/activity?weeks=${weeks}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch activity");
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch activity");
    }

    return result.data.activity;
  },

  /**
   * Mark achievements as notified (dismiss notifications)
   */
  async markAchievementsNotified(achievementIds: string[]): Promise<void> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/stats/achievements/notify`, {
      method: "POST",
      headers,
      body: JSON.stringify({ achievement_ids: achievementIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark achievements as notified");
    }
  },

  /**
   * Manually trigger achievement check
   */
  async checkAchievements(): Promise<Achievement[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/stats/check-achievements`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to check achievements");
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to check achievements");
    }

    return result.data.new_achievements;
  },

};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format seconds into human-readable duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  return `${minutes}m`;
}

/**
 * Format practice time for display
 */
export function formatPracticeTime(seconds: number): string {
  const hours = seconds / 3600;
  
  if (hours >= 1) {
    return `${hours.toFixed(1)} hrs`;
  }
  
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

/**
 * Get color class based on score
 */
export function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-amber-500";
  return "text-red-500";
}

/**
 * Get score label
 */
export function getScoreLabel(score: number | null): string {
  if (score === null) return "N/A";
  if (score >= 9) return "Excellent";
  if (score >= 8) return "Great";
  if (score >= 7) return "Good";
  if (score >= 6) return "Fair";
  return "Needs Work";
}
