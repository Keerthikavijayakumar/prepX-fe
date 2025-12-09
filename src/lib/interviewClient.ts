import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

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

export interface StartSessionResponse {
  success: boolean;
  error?: string;
  message?: string;
  session?: {
    id: string;
    room_name: string;
    status: string;
    start_time: string;
    server_end_time: string;
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
  status: "active" | "completed" | "ended_early" | "timeout";
  start_time: string;
  server_end_time: string;
  end_time?: string;
  end_reason?: string;
  livekit_room_name: string;
  score_overall?: number;
  summary?: string;
}

export interface EndSessionResponse {
  success: boolean;
  message?: string;
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
  async startSession(): Promise<StartSessionResponse> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/interviews/start`, {
        method: "POST",
        headers,
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
  };

  return errorMessages[error] || errorMessages.UNKNOWN_ERROR;
}
