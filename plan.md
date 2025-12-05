I’ll update the user flow and PRD to explicitly enforce a **server‑side, authoritative 30‑minute timer** and ensure that **sessions are auto‑closed/completed when time ends, even if the user is disconnected or offline**. I’ll regenerate the flow end‑to‑end with these rules baked in, keeping your concurrency and beta constraints. I’ll also track this as a new refinement in the TODO list.

## Updated Principles (based on your new requirement)

- **Authoritative timer is server‑side only**
- Interview duration = **exactly 30 minutes from `start_time` stored on backend**.
- Frontend timer is **only a display**, driven by _server‑sent_ timestamps (not its own local clock).
- **Auto‑completion even during network issues**
- When `start_time + 30 min` is reached, backend **must** mark the session as `completed` (or `timeout`) **even if the user is disconnected or offline**.
- On any later reconnect, the user sees the session as **ended**, not “active”.
  All previous constraints still apply:
- Max **5 concurrent active interviews** globally.
- **1 active session per user**.
- **Beta:** max **1 interview total per user** (regardless of whether they disconnected).
- Must have **resume on file** to start.

---

## Regenerated End‑to‑End Flow (with server‑side timer)

### 1. Resume → Eligibility

1. **Dashboard load**

- If no resume:
- Shows “Upload resume to unlock AI interview”.
- No interview CTA.
- If resume exists:
- Shows resume summary.
- Shows interview card with CTA.

2. **Eligibility logic (server‑side)**

- Before enabling “Start AI practice interview”, backend ensures:
- User authenticated.
- `resume_id` present.
- **No active session** for this user.
- **Beta:** user has **0 past interviews** (`status in (completed, ended_early, timeout)`).
- System‑wide `active_sessions_count < 5`.

3. **Frontend representation**

- CTA:
- **Enabled:** all checks pass.
- **Disabled:** with clear message:
- “All interview slots are in use” (capacity).
- “You’ve used your interview during beta” (beta).
- “Upload a resume to start” (resume missing).

---

### 2. Starting an Interview (server‑side timer initialization)

4. **User clicks “Start AI practice interview”**

- Frontend calls `POST /interview-sessions`.
- Backend transaction:
- Re‑checks:
- Concurrency `< 5`.
- No other active session for this user.
- Beta not exhausted.
- Creates `interview_session` row with:
- `status = active`
- `start_time = now()`
- `max_duration_seconds = 1800` (30 min)
- `server_end_time = start_time + interval '30 minutes'` (materialized for precision).
- Returns:
- `session_id`
- `start_time`
- `server_end_time`.

5. **Frontend navigation**

- Navigates to `/interview/{sessionId}` and **derives countdown from server timestamps**:
- `remaining = server_end_time - now_server`.
- `now_server` from:
- WebSocket presence, or
- Periodic `GET /interview-sessions/{id}` polling.
- Frontend **does not own** the business rule for “time is over”; it only mirrors backend.

---

### 3. During Interview (server‑side enforcement)

6. **Server‑side timer enforcement**

- A background job or room service monitors active sessions:
- Query: `WHERE status = 'active' AND now() >= server_end_time`.
- For each match:
- Set `status = completed` (or `timeout`).
- `end_time = server_end_time`.
- `end_reason = natural` (if full 30 min) or `timeout` (if you want to separate).
- Trigger analysis pipeline.
- This runs regardless of frontend state (open, closed, offline).

7. **Network behavior**

- If user **stays connected**:
- At ≈ 00:00, backend closes media/room and marks session as ended.
- Frontend sees `status` change to `completed` and navigates to results.
- If user **disconnects mid‑session**:
- Backend keeps `status = active` until either:
- User reconnects, or
- `now() >= server_end_time` → then marks `status = completed/timeout`.
- If user **never reconnects**:
- Session still ends at `server_end_time` and is marked as used for beta.

8. **Manual early termination**

- User clicks “Leave interview”.
- Frontend calls `POST /interview-sessions/{id}/end` with `reason = user_ended`.
- Backend:
- Sets `status = ended_early`.
- `end_time = now()`.
- `end_reason = user_ended`.
- Stops considering this session as `active` (releases one of the 5 slots).
- Triggers analysis on partial data.

---

### 4. Reconnect & Grace Handling

9. **User disconnects before 30 min**

- Backend marks a transient state (internal): `connection_state = disconnected`, but keeps `status = active`.
- Optional: track `last_seen_at` to set a _disconnection grace period_ (e.g., 5 min) for room resources.
- **Regardless of grace**, **server_end_time still rules**:
- If user returns before `server_end_time`:
- Backend allows rejoin to `/interview/{sessionId}`.
- Frontend:
- Fetches `start_time`, `server_end_time`, `status`.
- If `status = active`, shows remaining time from server.
- If user returns after `server_end_time`:
- Backend already marked `status = completed/timeout`.
- Frontend:
- On load, sees `status != active`.
- Redirects directly to “Session ended / Results” view.

10. **Edge case: offline when time ends**

- User closes laptop at minute 10.
- At minute 30:
- Backend job runs, sees `now >= server_end_time`.
- Marks session `status = completed/timeout`.
- Later, user opens dashboard:
- Sees that **interview is finished** and appears in history.
- Can open results (once analysis is ready).
- **No possibility** that session remains “open” beyond 30 minutes.

---

### 5. End & Results

11. **Session completion (natural or timeout)**

- On `status ∈ {completed, timeout, ended_early}`:
- Backend triggers or completes analysis.
- Stores:
- Scores, summary, strengths, growth areas.
- **Beta rule:** Any terminal state counts as **using the interview**.

12. **Frontend result flow**

- If user is still in room at end:
- Redirect to `/interviews/{id}/results` once `status` and analysis are ready.
- If user returns later:
- Dashboard “Interview history” shows:
- Date, duration, `end_reason`, score.
- “View report” link.

---

## Regenerated PRD Additions / Changes

### Constraints (updated)

- **Timer Authority**
- Duration is enforced **only by backend** using `start_time` + 30 minutes.
- Frontend is non‑authoritative and must never extend or shorten a session.
- **Network Independence**
- Session auto‑completion **does not depend** on active WebSocket clients.
- Completion must happen based solely on backend time, even if the user is offline.

### Functional Requirements (timer & status)

- **FR‑T1: Server‑side timer fields**
- `interview_sessions` must store:
  - `start_time` (timestamp with timezone).
  - `max_duration_seconds` (integer, default 1800).
  - `server_end_time` = `start_time + max_duration_seconds`.
- **FR‑T2: Auto‑completion job**
- Background worker runs every N seconds:
  - Finds sessions with `status = 'active' AND now() >= server_end_time`.
  - Marks them `status = 'completed'` or `timeout`.
  - Sets `end_time = server_end_time`.
  - Triggers analysis.
- **FR‑T3: Frontend timer display**
- Must request **authoritative** `start_time` and `server_end_time` from backend.
- Must recompute remaining time from those values (plus periodic sync).
- **No independent `setInterval` that defines end‑of‑session** logic.
- **FR‑T4: Reconnect behavior**
- `GET /interview-sessions/{id}` returns:
  - `status`, `start_time`, `server_end_time`, `end_time`.
- If `status != active`, clients must not show “Join session” UI and must route to “Session ended / Results” view.
- **FR‑T5: Beta counting**
- Any session that reaches `status ∈ {completed, timeout, ended_early}` sets:
  - `users.has_completed_interview = true` (or equivalent).
- Subsequent `POST /interview-sessions` requests must fail with a specific beta‑limit error.

### UX States (updated)

- **Interview room**
- **Active:** Timer driven by `server_end_time`.
- **Reconnecting:** Shows “Reconnecting…” while checking backend; still uses `server_end_time` for display.
- **Ended by time:** When API says `status = completed/timeout`, show “Time’s up – session ended” state and offer “View results”.
- **Ended while offline:** On page load, if `status != active`, skip reconnect state and show “Session ended while you were offline” + results.

---

## Status Summary

- **Covered:**
- Server‑authoritative 30‑minute timer.
- Auto‑closing sessions even when user is disconnected.
- Updated flow and PRD to reflect backend‑driven timing and reconnection behavior.
- **Next options (if you want):**
- I can draft **specific API contracts** (`POST /interview-sessions`, `GET /interview-sessions/{id}`, worker logic) or
- Show how to wire this into your existing `/interview/[roomId]` page + LiveKit backend design.
  -- WARNING: This schema is for context only and is not meant to be run.
  -- Table order and constraints may not be valid for execution.
  CREATE TABLE public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  storage_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  file_type text NOT NULL,
  parsed_data jsonb,
  parsing_status text NOT NULL DEFAULT 'pending'::text CHECK (parsing_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
  );
  CREATE TABLE public.users (
  id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  resume_id uuid,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id)
  );
  This is my existing tables in db.
  according make a step by step plan and changes needed to achieve our planned goal.
  Whenever there is the users returns to the interview page before the end time we have to allow the user to continue. If it's already completed / timer ends we have to show the appropriate message on the screen. Handle all the edge cases.
  Handle livekit also. Like token generation and all
