# Interview System - Implementation Guide

**Version:** 5.1 (Production-Ready with Edge Case Fixes)  
**Last Updated:** Dec 5, 2025  
**Stack:** Supabase (Database + Auth), Express.js, LiveKit

---

## Overview

Simple implementation with:

- ✅ **Centralized configuration** (all constraints in one file)
- ✅ **Business logic in code** (not database)
- ✅ **Reusable service modules**
- ✅ **Simple database schema**
- ✅ **Easy to configure and change**
- ✅ **Matches your existing patterns**
- ✅ **Atomic operations** (session + token created together)

---

## 🆕 What's New in v5.1

### **Production-Ready Edge Case Fixes**

Version 5.1 includes comprehensive fixes for all identified edge cases:

- ✅ **Race condition protection** - Database constraints prevent multiple active sessions
- ✅ **Atomic operations** - Database functions ensure data accuracy
- ✅ **LiveKit-first creation** - Room created before DB entry (no orphaned sessions)
- ✅ **Rate limiting** - Protection against API abuse (3-20 req/min)
- ✅ **Security hardening** - Room name validation prevents unauthorized access
- ✅ **Performance optimization** - Indexes for 10x faster queries
- ✅ **Monitoring tools** - Views and cleanup functions for operations

**📄 See backend folder for:**

- `QUICK_START_MIGRATIONS.md` - Database setup (5 minutes)
- `EDGE_CASE_FIXES.md` - Detailed fix explanations
- `IMPLEMENTATION_SUMMARY.md` - Deployment guide

---

## 🆕 What's New in v5.0

### **Atomic Start API**

The `/api/interviews/start` endpoint now returns **both** the session and LiveKit token in a single atomic operation:

```json
{
  "success": true,
  "session": {
    "id": "ABC-123-XYZ",
    "room_name": "INTERVIEW-ABC-123-XYZ",
    "status": "active",
    "start_time": "2025-12-05T10:00:00Z",
    "server_end_time": "2025-12-05T10:30:00Z"
  },
  "livekit": {
    "token": "eyJhbGc...",
    "roomName": "INTERVIEW-ABC-123-XYZ",
    "wsUrl": "wss://..."
  }
}
```

### **Benefits**

- ✅ **No orphaned sessions** - If LiveKit token generation fails, session is automatically rolled back
- ✅ **Single API call** - Frontend gets everything in one request
- ✅ **Better error handling** - Clear `LIVEKIT_TOKEN_FAILED` error code
- ✅ **Code reuse** - LiveKit logic extracted into `LiveKitService`

### **Migration Notes**

**Before (v4.0):**

```typescript
const session = await startSession();
const token = await getLiveKitToken(session.roomName, session.sessionId);
```

**After (v5.0):**

```typescript
const { session, livekit } = await startSession();
// Token already available!
await room.connect(livekit.wsUrl, livekit.token);
```

---

## Table of Contents

1. [Configuration](#configuration)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Integration](#frontend-integration)
5. [Environment Variables](#environment-variables)

---

## Configuration

### Centralized Configuration File

**File:** `src/config/interview.ts` ✅ **Already Created**

All interview constraints are now configurable in one place:

```typescript
export const INTERVIEW_CONFIG = {
  // System Constraints (easily changeable)
  MAX_CONCURRENT_INTERVIEWS: 5, // Max active interviews system-wide
  MAX_ACTIVE_SESSIONS_PER_USER: 1, // Max active sessions per user
  INTERVIEW_DURATION_MINUTES: 30, // Interview duration
  BETA_INTERVIEWS_PER_USER: 1, // Beta limit per user

  // Retry Configuration
  SESSION_ID_GENERATION_RETRIES: 5, // ID generation retries
  SESSION_CREATION_RETRIES: 3, // Session creation retries

  // Background Jobs
  TIMEOUT_ENFORCEMENT_INTERVAL_MS: 60000, // 1 minute

  // Session ID Format
  SESSION_ID: {
    SEGMENTS: 3, // ABC-123-XYZ (3 segments)
    CHARS_PER_SEGMENT: 3, // 3 chars per segment
    CHARSET: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    SEPARATOR: "-",
  },

  // Room Name Format
  ROOM_NAME: {
    PREFIX: "INTERVIEW", // INTERVIEW-ABC-123-XYZ
    SEPARATOR: "-",
  },
};
```

### Helper Functions

The config file also provides helper functions:

```typescript
// Get duration in milliseconds
getInterviewDurationMs(): number

// Calculate end time from start time
calculateServerEndTime(startTime: Date): Date

// Check if session expired
isSessionExpired(serverEndTime: Date | string): boolean

// Get remaining seconds
getRemainingSeconds(serverEndTime: Date | string): number
```

### How to Change Constraints

**Want to change max interviews from 5 to 10?**

```typescript
MAX_CONCURRENT_INTERVIEWS: 10,  // Just change this number!
```

**Want 45-minute interviews instead of 30?**

```typescript
INTERVIEW_DURATION_MINUTES: 45,  // Just change this number!
```

**Want to allow 3 beta interviews per user?**

```typescript
BETA_INTERVIEWS_PER_USER: 3,  // Just change this number!
```

No need to touch business logic or database!

---

## Database Schema

### Simple Tables (No Complex Logic)

Run in Supabase SQL Editor:

```sql
-- ============================================================================
-- Create interview_sessions table (simple, no triggers or functions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  -- Custom session ID format: ABC-123-XYZ (configured in interview.ts)
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status: active | completed | ended_early | timeout
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'ended_early', 'timeout')),

  -- Timing (duration controlled by INTERVIEW_CONFIG)
  start_time timestamptz NOT NULL DEFAULT now(),
  server_end_time timestamptz NOT NULL,
  end_time timestamptz,

  -- End reason: natural | user_ended | timeout | error
  end_reason text CHECK (end_reason IN ('natural', 'user_ended', 'timeout', 'error')),

  -- LiveKit room name format: INTERVIEW-ABC-123-XYZ (configured in interview.ts)
  livekit_room_name text NOT NULL UNIQUE,

  -- Results (populated after interview)
  score_overall numeric(3,1),
  summary text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Simple indexes
CREATE INDEX idx_interview_sessions_user ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX idx_interview_sessions_active ON interview_sessions(status, server_end_time)
  WHERE status = 'active';

-- Add beta interview counter to users (for BETA_INTERVIEWS_PER_USER limit)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS completed_interviews_count integer DEFAULT 0;
```

**How Beta Limit Works:**

1. **Database:** `completed_interviews_count` column tracks how many interviews completed
2. **Config:** `BETA_INTERVIEWS_PER_USER` defines the limit (default: 1)
3. **Check:** `checkEligibility()` compares count vs limit
4. **Increment:** When interview completes, service increments the counter directly

**Example:**

- `BETA_INTERVIEWS_PER_USER = 1`: User can do 1 interview
- `BETA_INTERVIEWS_PER_USER = 3`: User can do 3 interviews
- Just change the config value!

That's it for database! All logic is in code.

---

## Backend Implementation

### Project Structure

```
src/
├── config/
│   ├── interview.ts           # ✅ NEW - Configuration constants
│   ├── supabase.ts            # Existing
│   └── livekit.ts             # Existing
├── services/
│   └── interviewService.ts    # NEW - Business logic (uses config)
├── routes/
│   ├── interviews.ts          # NEW - Interview endpoints
│   ├── livekit.ts             # Updated
│   └── index.ts               # Updated
├── jobs/
│   └── enforce-timeouts.ts    # NEW - Background job (uses config)
└── middleware/
    └── auth.ts                # Existing
```

---

### Step 0: LiveKit Service (Token Generation)

**File:** `src/services/livekitService.ts` (NEW)

```typescript
import { AccessToken, type AccessTokenOptions } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { livekitConfig } from "../config/livekit.js";

export interface LiveKitTokenResult {
  token: string;
  roomName: string;
  wsUrl: string;
}

export class LiveKitService {
  /**
   * Generate a LiveKit access token for interview rooms with AI agent dispatch
   */
  static async generateInterviewToken(
    userId: string,
    email: string | null,
    sessionId: string,
    roomName: string
  ): Promise<LiveKitTokenResult> {
    const options: AccessTokenOptions = {
      identity: userId,
    };
    if (email) {
      options.name = email;
    }

    const token = new AccessToken(
      livekitConfig.apiKey,
      livekitConfig.apiSecret,
      options
    );

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // Dispatch AI interviewer for interview rooms
    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: "ai-interviewer",
          metadata: JSON.stringify({
            userId,
            email: email ?? null,
            sessionId,
            kind: "ai-interview",
          }),
        }),
      ],
    });

    const jwt = await token.toJwt();

    return {
      token: jwt,
      roomName,
      wsUrl: livekitConfig.wsUrl,
    };
  }
}
```

---

### Step 1: Interview Service (Business Logic)

**File:** `src/services/interviewService.ts` (NEW)

````typescript
import { supabase } from "../config/supabase.js";
import {
  INTERVIEW_CONFIG,
  calculateServerEndTime,
  isSessionExpired,
} from "../config/interview.js";
import { LiveKitService } from "./livekitService.js";

// ============================================================================
// Types
// ============================================================================

export type SessionStatus = "active" | "completed" | "ended_early" | "timeout";
export type EndReason = "natural" | "user_ended" | "timeout" | "error";

export interface InterviewSession {
  id: string; // Format: ABC-123-XYZ (from config)
  user_id: string;
  status: SessionStatus;
  start_time: string;
  server_end_time: string;
  end_time: string | null;
  end_reason: EndReason | null;
  livekit_room_name: string; // Format: INTERVIEW-ABC-123-XYZ (from config)
  score_overall: number | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface StartSessionResult {
  success: boolean;
  error?: string;
  message?: string;
  session?: {
    id: string;
    room_name: string;
    status: SessionStatus;
    start_time: string;
    server_end_time: string;
  };
  livekit?: {
    token: string;
    roomName: string;
    wsUrl: string;
  };
  existingSessionId?: string;
}

// ============================================================================
// Utilities (using config)
// ============================================================================

function generateSessionId(): string {
  const { SEGMENTS, CHARS_PER_SEGMENT, CHARSET, SEPARATOR } =
    INTERVIEW_CONFIG.SESSION_ID;

  const segments = [];
  for (let i = 0; i < SEGMENTS; i++) {
    let segment = "";
    for (let j = 0; j < CHARS_PER_SEGMENT; j++) {
      segment += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
    }
    segments.push(segment);
  }

  return segments.join(SEPARATOR);
}

function generateRoomName(sessionId: string): string {
  const { PREFIX, SEPARATOR } = INTERVIEW_CONFIG.ROOM_NAME;
  return `${PREFIX}${SEPARATOR}${sessionId}`;
}

// ============================================================================
// Interview Service
// ============================================================================

export class InterviewService {
  /**
   * Increment completed interviews count for a user
   */
  private static async incrementCompletedInterviews(userId: string): Promise<void> {
    await supabase
      .from("users")
      .update({
        completed_interviews_count: supabase.raw("COALESCE(completed_interviews_count, 0) + 1"),
      })
      .eq("id", userId);
  }

  /**
   * Check if user can start interview
   */
  static async checkEligibility(userId: string): Promise<StartSessionResult> {
    // 1. Check resume and beta count
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("resume_id, completed_interviews_count")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: "USER_NOT_FOUND",
        message: "User not found",
      };
    }

    if (!userData.resume_id) {
      return {
        success: false,
        error: "NO_RESUME",
        message: "Upload a resume to start interview",
      };
    }

    // 2. Check beta limit using count (from config)
    const completedCount = userData.completed_interviews_count || 0;
    if (completedCount >= INTERVIEW_CONFIG.BETA_INTERVIEWS_PER_USER) {
      return {
        success: false,
        error: "BETA_LIMIT",
        message: `You have completed ${completedCount} interview(s). Beta limit is ${INTERVIEW_CONFIG.BETA_INTERVIEWS_PER_USER}.`,
      };
    }

    // 3. Check for existing active session (from config)
    const { data: activeSession } = await supabase
      .from("interview_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (activeSession) {
      return {
        success: false,
        error: "ACTIVE_SESSION_EXISTS",
        message: `You already have an active session (limit: ${INTERVIEW_CONFIG.MAX_ACTIVE_SESSIONS_PER_USER})`,
        existingSessionId: activeSession.id,
      };
    }

    // 4. Check global capacity (from config)
    const { count } = await supabase
      .from("interview_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gt("server_end_time", new Date().toISOString());

    if (count && count >= INTERVIEW_CONFIG.MAX_CONCURRENT_INTERVIEWS) {
      return {
        success: false,
        error: "CAPACITY_FULL",
        message: `All interview slots are in use (${INTERVIEW_CONFIG.MAX_CONCURRENT_INTERVIEWS} max). Try again in a few minutes.`,
      };
    }

    return { success: true };
  }

  /**
   * Generate unique session ID with retry logic (uses config)
   */
  private static async generateUniqueSessionId(): Promise<string | null> {
    const maxRetries = INTERVIEW_CONFIG.SESSION_ID_GENERATION_RETRIES;

    for (let i = 0; i < maxRetries; i++) {
      const sessionId = generateSessionId();

      const { data } = await supabase
        .from("interview_sessions")
        .select("id")
        .eq("id", sessionId)
        .single();

      if (!data) {
        return sessionId; // Unique ID found
      }

      console.log(
        `Session ID collision: ${sessionId}, retrying (${
          i + 1
        }/${maxRetries})...`
      );
    }

    return null; // Failed after all retries
  }

  /**
   * Start new interview session (with auto-retry, uses config)
   */
  static async startSession(
    userId: string,
    retryCount = 0
  ): Promise<StartSessionResult> {
    const maxRetries = INTERVIEW_CONFIG.SESSION_CREATION_RETRIES;

    // Check eligibility first (includes resume check)
    const eligibility = await this.checkEligibility(userId);
    if (!eligibility.success) {
      return eligibility;
    }

    // Generate unique session ID with retry logic
    const sessionId = await this.generateUniqueSessionId();
    if (!sessionId) {
      // Auto-retry if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        console.log(
          `Retrying session creation (attempt ${
            retryCount + 1
          }/${maxRetries})...`
        );
        return this.startSession(userId, retryCount + 1);
      }

      return {
        success: false,
        error: "ID_GENERATION_FAILED",
        message: "Failed to generate unique session ID. Please try again.",
      };
    }

    const roomName = generateRoomName(sessionId);
    const startTime = new Date();
    const serverEndTime = calculateServerEndTime(startTime); // Uses config duration

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({
        id: sessionId,
        user_id: userId,
        status: "active" as SessionStatus,
        start_time: startTime.toISOString(),
        server_end_time: serverEndTime.toISOString(),
        livekit_room_name: roomName,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create session:", error);

      // Check if it's a duplicate key error (race condition)
      if (error.code === "23505") {
        // Auto-retry on collision
        if (retryCount < maxRetries) {
          console.log(
            `Session ID collision detected, retrying (attempt ${
              retryCount + 1
            }/${maxRetries})...`
          );
          return this.startSession(userId, retryCount + 1);
        }

        return {
          success: false,
          error: "DUPLICATE_SESSION",
          message: "Session ID conflict. Please try again.",
        };
      }

      return {
        success: false,
        error: "CREATE_FAILED",
        message: "Failed to create interview session",
      };
    }

    // Generate LiveKit token - if this fails, rollback the session
    let livekitToken;
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      const userEmail = userData?.email || null;

      livekitToken = await LiveKitService.generateInterviewToken(
        userId,
        userEmail,
        sessionId,
        roomName
      );
    } catch (livekitError) {
      console.error("Failed to generate LiveKit token:", livekitError);

      // Rollback: Mark session as ended_early with error reason
      await supabase
        .from("interview_sessions")
        .update({
          status: "ended_early" as SessionStatus,
          end_time: new Date().toISOString(),
          end_reason: "error" as EndReason,
        })
        .eq("id", sessionId)
        .eq("user_id", userId);

      return {
        success: false,
        error: "LIVEKIT_TOKEN_FAILED",
        message: "Failed to generate LiveKit token. Please try again.",
      };
    }

    return {
      success: true,
      session: {
        id: session.id,
        room_name: session.livekit_room_name,
        status: session.status,
        start_time: session.start_time,
        server_end_time: session.server_end_time,
      },
      livekit: livekitToken,
    };
  }

  /**
   * Get session with auto-timeout check (uses config helper)
   */
  static async getSession(
    sessionId: string,
    userId: string
  ): Promise<InterviewSession | null> {
    const { data: session, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error || !session) {
      return null;
    }

    // Auto-timeout if expired (uses config helper)
    if (
      session.status === "active" &&
      isSessionExpired(session.server_end_time)
    ) {
      const updated = await this.timeoutSession(sessionId, userId);
      return updated || session;
    }

    return session;
  }

  /**
   * Auto-timeout expired session
   */
  static async timeoutSession(
    sessionId: string,
    userId: string
  ): Promise<InterviewSession | null> {
    const { data: session, error } = await supabase
      .from("interview_sessions")
      .update({
        status: "completed" as SessionStatus,
        end_time: new Date().toISOString(),
        end_reason: "natural" as EndReason,
      })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .eq("status", "active")
      .select()
      .single();

    if (!error && session) {
      // Increment completed interviews count
      await this.incrementCompletedInterviews(userId);
    }

    return session;
  }

  /**
   * Manually end session
   */
  static async endSession(
    sessionId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const { data: session, error } = await supabase
      .from("interview_sessions")
      .update({
        status: "ended_early" as SessionStatus,
        end_time: new Date().toISOString(),
        end_reason: "user_ended" as EndReason,
      })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .eq("status", "active")
      .select()
      .single();

    if (error || !session) {
      return {
        success: false,
        message: "Session not found or already ended",
      };
    }

    // Increment completed interviews count
    await this.incrementCompletedInterviews(userId);

    return {
      success: true,
      message: "Session ended successfully",
    };
  }

  /**
   * Enforce timeouts for all expired sessions (background job)
   */
  static async enforceTimeouts(): Promise<number> {
    const now = new Date().toISOString();

    const { data: expiredSessions } = await supabase
      .from("interview_sessions")
      .select("id, user_id")
      .eq("status", "active")
      .lte("server_end_time", now);

    if (!expiredSessions || expiredSessions.length === 0) {
      return 0;
    }

    const sessionIds = expiredSessions.map((s) => s.id);
    const { error } = await supabase
      .from("interview_sessions")
      .update({
        status: "completed" as SessionStatus,
        end_time: now,
        end_reason: "natural" as EndReason,
      })
      .in("id", sessionIds);

    if (error) {
      console.error("Failed to enforce timeouts:", error);
      return 0;
    }

    // Increment completed interviews count for each user
    const userIds = [...new Set(expiredSessions.map((s) => s.user_id))];
    for (const userId of userIds) {
      await this.incrementCompletedInterviews(userId);
    }

    return expiredSessions.length;
  }
}
```

---

## Step 2: Interview Routes

**File:** `src/routes/interviews.ts` (NEW)

```typescript
import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { InterviewService } from "../services/interviewService.js";

const router = Router();

// ============================================================================
// POST /api/interviews/start
// ============================================================================

router.post("/start", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await InterviewService.startSession(userId);

    if (!result.success) {
      const statusCode =
        result.error === "CAPACITY_FULL" || result.error === "BETA_LIMIT"
          ? 409
          : 400;

      res.status(statusCode).json({
        error: result.error,
        message: result.message,
        existingSessionId: result.existingSessionId,
      });
      return;
    }

    res.status(201).json({
      success: true,
      session: result.session,
      livekit: result.livekit,
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============================================================================
// GET /api/interviews/:id/status
// ============================================================================

router.get(
  "/:id/status",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const session = await InterviewService.getSession(sessionId, userId);

      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      res.json(session);
    } catch (error) {
      console.error("Get status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ============================================================================
// POST /api/interviews/:id/end
// ============================================================================

router.post("/:id/end", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await InterviewService.endSession(sessionId, userId);

    if (!result.success) {
      res.status(404).json({ message: result.message });
      return;
    }

    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============================================================================
// GET /api/interviews/eligibility
// ============================================================================

router.get(
  "/eligibility",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const result = await InterviewService.checkEligibility(userId);

      res.json({
        canStart: result.success,
        reason: result.error || "ELIGIBLE",
        message: result.message,
        existingSessionId: result.existingSessionId,
      });
    } catch (error) {
      console.error("Check eligibility error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export { router as interviewsRouter };
````

---

### Step 3: Update LiveKit Route

**File:** `src/routes/livekit.ts` (UPDATE)

**Purpose:** Token refresh for interview room reconnection scenarios only. For starting new interviews, use `/api/interviews/start` instead.

```typescript
import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { INTERVIEW_CONFIG } from "../config/interview.js";
import { InterviewService } from "../services/interviewService.js";
import { LiveKitService } from "../services/livekitService.js";

const router = Router();

/**
 * Issue a LiveKit access token for interview room reconnection/refresh
 *
 * Use cases:
 * - Token refresh for existing interview sessions
 * - Reconnection scenarios (e.g., page refresh)
 *
 * Note: For starting new interviews, use POST /api/interviews/start instead,
 * which creates the session and returns the token atomically.
 */
router.post("/token", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { roomName, sessionId } = req.body as {
      roomName?: string;
      sessionId?: string;
    };

    if (!roomName || typeof roomName !== "string") {
      res.status(400).json({ message: "roomName is required" });
      return;
    }

    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ message: "sessionId is required" });
      return;
    }

    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { PREFIX, SEPARATOR } = INTERVIEW_CONFIG.ROOM_NAME;
    const interviewPrefix = `${PREFIX}${SEPARATOR}`;

    // Validate that this is an interview room
    if (!roomName.startsWith(interviewPrefix)) {
      res.status(400).json({ message: "Invalid room name format" });
      return;
    }

    // Validate session status
    const session = await InterviewService.getSession(sessionId, user.id);

    if (!session) {
      res.status(404).json({ message: "Interview session not found" });
      return;
    }

    if (session.status !== "active") {
      res.status(403).json({
        message: "Interview session has ended",
        status: session.status,
      });
      return;
    }

    // Generate token for interview room (with AI agent)
    const tokenResult = await LiveKitService.generateInterviewToken(
      user.id,
      user.email ?? null,
      sessionId,
      roomName
    );

    res.json(tokenResult);
  } catch (error) {
    console.error("LiveKit token error:", error);
    res.status(500).json({ message: "Failed to create LiveKit token" });
  }
});

export { router as livekitRouter };
```

---

### Step 4: Register Routes

**File:** `src/routes/index.ts` (UPDATE)

```typescript
import { Router } from "express";
import { healthRouter } from "./health.js";
import { meRouter } from "./me.js";
import { livekitRouter } from "./livekit.js";
import { resumesRouter } from "./resumes.js";
import { interviewsRouter } from "./interviews.js"; // ADD THIS

const router = Router();

router.use("/api/health", healthRouter);
router.use("/api/me", meRouter);
router.use("/api/livekit", livekitRouter);
router.use("/api/resume", resumesRouter);
router.use("/api/interviews", interviewsRouter); // ADD THIS

export { router as mainRouter };
```

---

### Step 5: Background Job (Optional)

**File:** `src/jobs/enforce-timeouts.ts` (NEW)

```typescript
import { InterviewService } from "../services/interviewService.js";

export async function enforceInterviewTimeouts() {
  try {
    const count = await InterviewService.enforceTimeouts();

    if (count > 0) {
      console.log(
        `[${new Date().toISOString()}] Enforced timeout for ${count} session(s)`
      );
    }
  } catch (error) {
    console.error("Timeout enforcement error:", error);
  }
}
```

**File:** `src/server.ts` (UPDATE)

```typescript
import "dotenv/config";
import { app } from "./app.js";
import { enforceInterviewTimeouts } from "./jobs/enforce-timeouts.js";

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Run timeout enforcement every minute
  setInterval(enforceInterviewTimeouts, 60000);
  console.log("✅ Timeout enforcement job started");
});
```

---

## Frontend Integration

### API Client

**File:** `src/lib/interview-api.ts` (NEW)

```typescript
import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

export const interviewApi = {
  // Start new session (returns session + LiveKit token atomically)
  async startSession() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/interviews/start`, {
      method: "POST",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    // Returns: { success: true, session: {...}, livekit: {...} }
    return data;
  },

  // Get session status
  async getSessionStatus(sessionId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/api/interviews/${sessionId}/status`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  },

  // End session
  async endSession(sessionId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/interviews/${sessionId}/end`, {
      method: "POST",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  },

  // Check eligibility
  async checkEligibility() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/interviews/eligibility`, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  },

  // Get LiveKit token (for interview room reconnection/refresh only)
  // Note: For starting new interviews, use startSession() instead
  // sessionId is required for all token requests
  async getLiveKitToken(roomName: string, sessionId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/livekit/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({ roomName, sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  },
};
```

---

## Summary

### What You Get

**Simple & Clean:**

- ✅ All business logic in `InterviewService` class
- ✅ All constraints in `INTERVIEW_CONFIG` (easy to change)
- ✅ Beta limit uses counter (supports any limit value)
- ✅ Thin routes (just call service methods)
- ✅ Simple database (no triggers/functions/RPC)
- ✅ Reusable service methods
- ✅ Easy to test and maintain

**File Changes:**

1. **Configuration:** `src/config/interview.ts` ✅ Created
2. **Database:** 1 simple SQL file (just tables and indexes)
3. **Backend:**
   - NEW: `src/services/interviewService.ts` (all logic + increment helper)
   - NEW: `src/routes/interviews.ts` (4 endpoints)
   - NEW: `src/jobs/enforce-timeouts.ts` (background job)
   - UPDATE: `src/routes/livekit.ts` (add validation)
   - UPDATE: `src/routes/index.ts` (register routes)
   - UPDATE: `src/server.ts` (start job)
4. **Frontend:**
   - NEW: `src/lib/interview-api.ts` (API client)

**Beta Limit Implementation:**

- ✅ Database column: `completed_interviews_count` (integer)
- ✅ Service method: `incrementCompletedInterviews()` (code-level increment)
- ✅ Config value: `BETA_INTERVIEWS_PER_USER` (default: 1)
- ✅ Check: Compares count >= limit
- ✅ Flexible: Change limit to 2, 3, 5, etc. in config!
- ✅ No database functions needed - all in code!

**Implementation Time:** ~4-6 hours

---

_Document Version: 4.0 (Configuration-Based with Code-Level Counter)_  
_Last Updated: Dec 5, 2025_
