import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get authentication headers for API requests
 * Gracefully handles auth errors
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Auth session error:", error);
      throw new Error("Authentication failed. Please sign in again.");
    }

    if (!session?.access_token) {
      throw new Error("Not authenticated. Please sign in.");
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  } catch (error: any) {
    console.error("Failed to get auth headers:", error);
    throw new Error(error.message || "Authentication error");
  }
}

/**
 * Interview API response types
 */
export interface EligibilityResponse {
  success: boolean;
  error?: string;
  message?: string;
  canStart?: boolean;
  reason?: string;
  existingSessionId?: string; // Session ID if ACTIVE_SESSION_EXISTS
}

export interface InterviewConfig {
  complexity: "beginner" | "intermediate" | "advanced";
  duration_minutes: 15 | 30;
  target_role: string;
  target_company?: string;
  job_description?: string;
  sections?: InterviewSection[];
}

export interface InterviewSection {
  name: string;
  weight: number;
  min_questions: number;
  max_questions: number;
}

export interface InterviewPlan {
  sections: InterviewSection[];
  total_duration_seconds: number;
  estimated_questions: number;
}

export interface GeneratePlanResponse {
  success: boolean;
  error?: string;
  message?: string;
  plan?: InterviewPlan;
}

export interface StartSessionResponse {
  success: boolean;
  error?: string;
  message?: string;
  session?: {
    id: string;
    room_name: string;
    status: string;
    started_at: string;
  };
  livekit?: {
    token: string;
    roomName: string;
    wsUrl: string;
  };
}

export interface SessionResponse {
  id: string;
  user_id: string;
  status: "active" | "completed" | "failed" | "timeout";
  started_at: string;
  ended_at?: string;
  room_name: string;
  complexity: "beginner" | "intermediate" | "advanced";
  target_role?: string;
  target_company?: string;
  job_description?: string;
  duration_minutes: number;
  sections?: InterviewSection[];
  score_overall?: number;
  feedback_summary?: string;
  feedback_details?: any;
  transcript?: any;
}

export interface EndSessionResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
}

export interface InterviewHistoryItem {
  id: string;
  status: "active" | "completed" | "failed" | "timeout";
  started_at: string;
  ended_at?: string;
  target_role?: string;
  target_company?: string;
  complexity: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  score_overall?: number;
  feedback_summary?: string;
  actual_duration_seconds?: number;
}

export interface PaginatedHistoryResponse {
  success: boolean;
  interviews: InterviewHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LiveKitTokenResponse {
  token: string;
  wsUrl: string;
  roomName: string;
}

/**
 * Centralized Interview API Client
 *
 * All interview-related API calls go through this client.
 * Handles authentication, error handling, and response parsing.
 */
export const interviewApi = {
  /**
   * Generate interview plan using AI
   *
   * Creates customized interview sections based on:
   * - User's resume/profile
   * - Target role and company
   * - Complexity level
   * - Job description (if provided)
   */
  async generatePlan(config: Omit<InterviewConfig, "sections">): Promise<GeneratePlanResponse> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/interviews/plan`, {
        method: "POST",
        headers,
        body: JSON.stringify(config),
        signal: AbortSignal.timeout(30000), // 30 second timeout for AI generation
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse plan response:", parseError);
        return {
          success: false,
          error: "PARSE_ERROR",
          message: "Invalid response from server. Please try again.",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "UNKNOWN_ERROR",
          message: data.message || "Failed to generate interview plan",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Plan generation error:", error);

      if (error.name === "AbortError" || error.name === "TimeoutError") {
        return {
          success: false,
          error: "TIMEOUT_ERROR",
          message: "Plan generation timed out. Please try again.",
        };
      }

      return {
        success: false,
        error: "NETWORK_ERROR",
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  /**
   * Check if user is eligible to start an interview
   *
   * Checks:
   * - Resume uploaded
   * - Beta limit not exceeded
   * - No active session
   * - System capacity available
   */
  async checkEligibility(): Promise<EligibilityResponse> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/interviews/eligibility`, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Gracefully handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse eligibility response:", parseError);
        return {
          success: false,
          error: "PARSE_ERROR",
          message: "Invalid response from server. Please try again.",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "UNKNOWN_ERROR",
          message: data.message || "Failed to check eligibility",
          existingSessionId: data.existingSessionId, // Pass through session ID
        };
      }

      return data;
    } catch (error: any) {
      console.error("Eligibility check error:", error);

      // Handle specific error types
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        return {
          success: false,
          error: "TIMEOUT_ERROR",
          message:
            "Request timed out. Please check your connection and try again.",
        };
      }

      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error.message || "Network error. Please check your connection.",
      };
    }
  },

  /**
   * Start a new interview session
   *
   * Returns session + LiveKit token atomically.
   * Only creates session if LiveKit room is successfully created.
   *
   * Rate limited: 3 requests per 60 seconds
   */
  async startSession(config: InterviewConfig): Promise<StartSessionResponse> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/interviews/start`, {
        method: "POST",
        headers,
        body: JSON.stringify(config),
        signal: AbortSignal.timeout(15000), // 15 second timeout for session creation
      });

      // Gracefully handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse start session response:", parseError);
        return {
          success: false,
          error: "PARSE_ERROR",
          message: "Invalid response from server. Please try again.",
        };
      }

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          return {
            success: false,
            error: "RATE_LIMIT",
            message:
              data.message ||
              "Too many requests. Please wait a moment and try again.",
          };
        }

        return {
          success: false,
          error: data.error || "UNKNOWN_ERROR",
          message: data.message || "Failed to start interview session",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Start session error:", error);

      // Handle specific error types
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        return {
          success: false,
          error: "TIMEOUT_ERROR",
          message: "Request timed out. Please try again.",
        };
      }

      return {
        success: false,
        error: "NETWORK_ERROR",
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  /**
   * Get session details
   *
   * Returns current session status and metadata.
   * Automatically marks session as timed out if expired.
   */
  async getSession(sessionId: string): Promise<SessionResponse | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/interviews/${sessionId}`, {
        method: "GET",
        headers,
      });

      if (response.status === 404) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get session");
      }

      return data;
    } catch (error: any) {
      console.error("Get session error:", error);
      throw error;
    }
  },

  /**
   * End an active interview session
   *
   * Marks session as ended and increments completed count.
   */
  async endSession(sessionId: string): Promise<EndSessionResponse> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_URL}/api/interviews/${sessionId}/end`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to end session",
        };
      }

      return data;
    } catch (error: any) {
      console.error("End session error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  },

  /**
   * Get LiveKit token for reconnection/refresh
   *
   * Use cases:
   * - Page refresh during active interview
   * - Token expiration (after 6 hours)
   * - Connection drop recovery
   *
   * Note: For starting NEW interviews, use startSession() instead.
   *
   * Rate limited: 20 requests per 60 seconds
   */
  async getLiveKitToken(
    roomName: string,
    sessionId: string
  ): Promise<LiveKitTokenResponse> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/livekit/token`, {
        method: "POST",
        headers,
        body: JSON.stringify({ roomName, sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get LiveKit token");
      }

      return data;
    } catch (error: any) {
      console.error("Get LiveKit token error:", error);
      throw error;
    }
  },

  /**
   * Get user's interview history
   *
   * Returns list of past interviews with scores and status
   */
  async getHistory(): Promise<InterviewHistoryItem[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/interviews/history`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.interviews || [];
    } catch (error: any) {
      console.error("Get history error:", error);
      return [];
    }
  },

  /**
   * Get user's interview history with pagination
   *
   * @param page - Page number (1-indexed)
   * @param limit - Items per page (max 50)
   * @param status - Optional filter by status (completed, failed, timeout)
   */
  async getHistoryPaginated(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<PaginatedHistoryResponse> {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) {
        params.append("status", status);
      }

      const response = await fetch(
        `${API_URL}/api/interviews/history/paginated?${params}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        return {
          success: false,
          interviews: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get paginated history error:", error);
      return {
        success: false,
        interviews: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },
};

/**
 * Helper function to get user-friendly error messages
 */
export function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    NO_RESUME: "Please upload your resume before starting an interview.",
    BETA_LIMIT: "You've reached the beta limit for practice interviews.",
    ACTIVE_SESSION_EXISTS:
      "You already have an active interview session. Please end it first.",
    CAPACITY_FULL: "System is at capacity. Please try again in a few minutes.",
    LIVEKIT_TOKEN_FAILED: "Failed to create interview room. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
    TIMEOUT_ERROR:
      "Request timed out. Please check your connection and try again.",
    PARSE_ERROR: "Invalid server response. Please try again.",
    RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
    // Additional error codes from backend
    DUPLICATE_ROOM: "Room conflict detected. Please try again.",
    ROOM_GENERATION_FAILED: "Failed to generate interview room. Please try again.",
    USER_FETCH_FAILED: "Failed to load your profile. Please try again.",
    CREATE_FAILED: "Failed to create interview session. Please try again.",
    USER_NOT_FOUND: "User profile not found. Please sign in again.",
    AI_ERROR: "AI service is temporarily unavailable. Please try again later.",
    AI_TIMEOUT: "AI request timed out. Please try again.",
  };

  return errorMessages[error] || errorMessages.UNKNOWN_ERROR;
}
