"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  VideoTrack,
  useTracks,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Room, Track } from "livekit-client";

import { InterviewLayout } from "@/components/interview/InterviewLayout";
import { interviewApi } from "@/lib/interviewClient";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface InterviewPageProps {
  params: Promise<{
    room: string;
  }>;
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { room: sessionId } = use(params);

  // LiveKit connection state
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent scrolling while on the interview page.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  /**
   * Setup LiveKit connection
   *
   * Flow:
   * 1. Check sessionStorage for token (first load from dashboard)
   * 2. If not found, fetch fresh token from API (page refresh scenario)
   * 3. Validate session is still active
   */
  useEffect(() => {
    async function setupLiveKit() {
      try {
        // Try to get token from sessionStorage (first load)
        const storedData = sessionStorage.getItem(`interview_${sessionId}`);

        if (storedData) {
          try {
            const {
              token: storedToken,
              wsUrl: storedWsUrl,
              roomName: storedRoomName,
              targetRole: storedTargetRole,
            } = JSON.parse(storedData);

            if (storedToken && storedWsUrl && storedRoomName) {
              // Use stored credentials
              setToken(storedToken);
              setWsUrl(storedWsUrl);
              setRoomName(storedRoomName);
              if (storedTargetRole) setTargetRole(storedTargetRole);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.error("Failed to parse stored session data:", parseError);
            // Continue to fetch fresh token
          }
        }

        // No stored token or parse failed: fetch fresh token
        // First, verify session is still active
        const session = await interviewApi.getSession(sessionId);

        if (!session) {
          setError("Session not found. Please start a new interview.");
          setLoading(false);
          return;
        }

        if (session.status !== "active") {
          setError(
            `Session is ${session.status}. Please start a new interview.`
          );
          setLoading(false);
          return;
        }

        // Get fresh LiveKit token
        const livekitData = await interviewApi.getLiveKitToken(
          session.room_name,
          sessionId
        );

        setToken(livekitData.token);
        setWsUrl(livekitData.wsUrl);
        setRoomName(livekitData.roomName);
        // Extract target role from session
        if (session.target_role) {
          setTargetRole(session.target_role);
        }
        setLoading(false);
      } catch (err: any) {
        console.error("Error setting up LiveKit:", err);
        const errorMessage =
          err.message || "Failed to connect to interview. Please try again.";
        setError(errorMessage);
        setLoading(false);
      }
    }

    setupLiveKit();
  }, [sessionId, searchParams, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">
            Connecting to your AI interview...
          </p>
        </div>
      </div>
    );
  }

  if (error || !token || !wsUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex flex-col items-center gap-3 max-w-md">
          <div className="rounded-full bg-destructive/10 p-3">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Connection Failed</h2>
          <p className="text-sm text-muted-foreground">
            {error ||
              "Unable to connect to the interview room. Please try again."}
          </p>
          <Button onClick={() => router.push("/dashboard")} className="mt-2">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom token={token} serverUrl={wsUrl} connect audio video>
      <RoomAudioRenderer />
      <StartAudio label="Enable audio" />
      <InterviewExperience
        sessionId={sessionId}
        roomName={roomName || sessionId}
        targetRole={targetRole}
        onEndCall={() => router.push(`/interview/${sessionId}/results`)}
      />
    </LiveKitRoom>
  );
}

function InterviewExperience({
  sessionId,
  roomName,
  targetRole,
  onEndCall,
}: {
  sessionId: string;
  roomName: string;
  targetRole?: string;
  onEndCall: () => void;
}) {
  const [endingSession, setEndingSession] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  /**
   * Handle end call with confirmation
   */
  const handleEndCallRequest = () => {
    setShowEndConfirm(true);
  };

  const handleEndCallConfirm = async () => {
    if (endingSession) return;

    setEndingSession(true);
    setShowEndConfirm(false);

    try {
      // End session via API
      await interviewApi.endSession(sessionId);
    } catch (error) {
      console.error("Failed to end session:", error);
      // Continue anyway - user wants to leave
    } finally {
      // Navigate to results page instead of dashboard
      onEndCall();
    }
  };

  const handleEndCallCancel = () => {
    setShowEndConfirm(false);
  };
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ccOn, setCcOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  type SubtitleEntry = { id: string; speaker: string; text: string };
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  
  // Timer state for elapsed time (streamed from agent via data channel)
  const [elapsedTime, setElapsedTime] = useState("00:00");

  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string | undefined>();
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>();
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | undefined>();

  // Check if agent is in the room
  const agentInRoom = participants.some((p) => {
    if (p.isLocal) return false;
    return (
      p.identity === "ai-interviewer" ||
      p.identity?.toLowerCase().includes("agent") ||
      (() => {
        if (!p.metadata) return false;
        try {
          const meta = JSON.parse(p.metadata as string);
          return meta?.kind === "ai-interview" || meta?.agent === true;
        } catch {
          return false;
        }
      })()
    );
  });

  // Listen for room disconnection - when agent session ends, room is deleted and we get disconnected
  // Agent-driven lifecycle: when agent finishes, it ends the session which deletes the room
  useEffect(() => {
    if (!room) return;

    const handleDisconnected = () => {
      console.log("[Interview] Room disconnected - agent session ended, redirecting to results");
      onEndCall();
    };

    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("disconnected", handleDisconnected);
    };
  }, [room, onEndCall]);

  // Listen for elapsed time updates from agent via text stream
  useEffect(() => {
    if (!room) return;

    const handleElapsedTimeStream = async (reader: any, participantInfo: any) => {
      try {
        const timeText = await reader.readAll();
        if (timeText && /^\d{2}:\d{2}$/.test(timeText.trim())) {
          setElapsedTime(timeText.trim());
        }
      } catch (err) {
        console.error("[Interview] Error reading elapsed time stream:", err);
      }
    };

    // Register handler for elapsed time text stream topic
    try {
      if (typeof (room as any).registerTextStreamHandler === "function") {
        (room as any).registerTextStreamHandler("lk.elapsed_time", handleElapsedTimeStream);
      }
    } catch (err) {
      console.error("[Interview] Error registering text stream handler:", err);
    }

    return () => {
      // Unregister on cleanup
      if (typeof (room as any).unregisterTextStreamHandler === "function") {
        (room as any).unregisterTextStreamHandler("lk.elapsed_time");
      }
    };
  }, [room]);

  // Load available media devices from LiveKit
  useEffect(() => {
    let cancelled = false;
    async function loadDevices() {
      try {
        const [mics, cams, speakers] = await Promise.all([
          Room.getLocalDevices("audioinput"),
          Room.getLocalDevices("videoinput"),
          Room.getLocalDevices("audiooutput"),
        ]);
        if (cancelled) return;
        setMicDevices(mics);
        setCameraDevices(cams);
        setSpeakerDevices(speakers);

        if (!selectedMicId && mics[0]) setSelectedMicId(mics[0].deviceId);
        if (!selectedCameraId && cams[0]) setSelectedCameraId(cams[0].deviceId);
        if (!selectedSpeakerId && speakers[0])
          setSelectedSpeakerId(speakers[0].deviceId);
      } catch (err) {
        console.error("Failed to load media devices", err);
      }
    }

    loadDevices();
    return () => {
      cancelled = true;
    };
    // Run once on mount; selections are updated via state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to LiveKit transcription text streams and drive subtitles (streaming)
  useEffect(() => {
    if (!room) return;

    const handler = async (
      reader: any,
      info: { identity?: string } | undefined
    ) => {
      try {
        const attrs = reader.info?.attributes ?? {};
        const isTranscription = !!attrs["lk.transcribed_track_id"];
        const hasSegmentId = !!attrs["lk.segment_id"];
        // Accept transcription or segment_id to not drop first line
        if (!isTranscription && !hasSegmentId) return;

        const senderIdentity = info?.identity;
        const trackSid = attrs["lk.transcribed_track_id"] as string | undefined;
        let label = "";

        // Detect local participant by track ID
        const localAudioPubs = ((localParticipant as any)?.audioTracks ?? []) as any[];
        const isLocalByTrack =
          !!trackSid && localAudioPubs.some((pub) => pub.trackSid === trackSid);

        if (isLocalByTrack) {
          label = "You";
        } else if (senderIdentity) {
          const participant = participants.find((p) => p.identity === senderIdentity);
          if (participant) {
            const baseName = participant.name || participant.identity || "Guest";
            label = participant.isLocal ? "You" : baseName;
          }
        }

        // Default label for agent
        if (!label && !isLocalByTrack) {
          label = "AI";
        }

        const segmentId = (attrs["lk.segment_id"] as string | undefined) ?? "";
        const id = segmentId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        // Stream text chunks as they arrive instead of waiting for completion
        let accumulatedText = "";
        
        // Use streaming read for real-time captions
        for await (const chunk of reader) {
          const chunkText = typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
          accumulatedText += chunkText;
          
          // Update subtitles with each chunk for live streaming effect
          setSubtitles((prev) => {
            const baseLabel = label || "";
            const existingIndex = segmentId ? prev.findIndex((s) => s.id === id) : -1;

            if (existingIndex !== -1) {
              const next = [...prev];
              next[existingIndex] = {
                ...next[existingIndex],
                speaker: baseLabel || next[existingIndex].speaker,
                text: accumulatedText,
              };
              return next;
            }

            // Skip empty text
            if (!accumulatedText.trim().length) return prev;

            const next = [...prev, { id, speaker: baseLabel, text: accumulatedText }];
            return next.slice(-20);
          });
        }
      } catch (err) {
        // Fallback to readAll if streaming fails
        try {
          const message = await reader.readAll();
          const attrs = reader.info?.attributes ?? {};
          const segmentId = (attrs["lk.segment_id"] as string | undefined) ?? "";
          const id = segmentId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const text = typeof message === "string" ? message : String(message ?? "");
          
          if (text.trim()) {
            setSubtitles((prev) => {
              const next = [...prev, { id, speaker: "AI", text }];
              return next.slice(-20);
            });
          }
        } catch (fallbackErr) {
          console.error("Error handling transcription", fallbackErr);
        }
      }
    };

    // 'lk.transcription' includes both user and agent STT/TTS output
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    room.registerTextStreamHandler?.("lk.transcription", handler);

    return () => {
      if (
        room &&
        typeof (room as any).unregisterTextStreamHandler === "function"
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (room as any).unregisterTextStreamHandler("lk.transcription", handler);
      }
    };
  }, [room, participants, localParticipant]);

  const handleToggleMic = async () => {
    const next = !micOn;
    try {
      await localParticipant?.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch (err) {
      console.error("Failed to toggle microphone", err);
    }
  };

  const handleToggleCam = async () => {
    const next = !camOn;
    try {
      await localParticipant?.setCameraEnabled(next);
      setCamOn(next);
    } catch (err) {
      console.error("Failed to toggle camera", err);
    }
  };

  const handleMicDeviceChange = async (deviceId: string) => {
    try {
      if (!room) return;
      // Use the room instance API to switch the active microphone device
      await (room as any).switchActiveDevice("audioinput", deviceId);
      setSelectedMicId(deviceId);
    } catch (err) {
      console.error("Failed to switch microphone", err);
    }
  };

  const handleCameraDeviceChange = async (deviceId: string) => {
    try {
      if (!room) return;
      // Use the room instance API to switch the active camera device
      await (room as any).switchActiveDevice("videoinput", deviceId);
      setSelectedCameraId(deviceId);
    } catch (err) {
      console.error("Failed to switch camera", err);
    }
  };

  const handleSpeakerDeviceChange = async (deviceId: string) => {
    try {
      if (!room) return;
      // Use the room instance API to switch the active speaker / audio output device
      await (room as any).switchActiveDevice("audiooutput", deviceId);
      setSelectedSpeakerId(deviceId);
    } catch (err) {
      console.error("Failed to switch speakers", err);
    }
  };

  // Build tiles from participants
  const participantTiles = participants.map((p) => {
    const isLocal = p.isLocal;
    const isAi =
      p.identity === "ai-interviewer" ||
      p.identity?.toLowerCase().includes("agent") ||
      (() => {
        if (!p.metadata) return false;
        try {
          const meta = JSON.parse(p.metadata as string);
          return meta?.kind === "ai-interview" || meta?.agent === true;
        } catch {
          return false;
        }
      })();

    const name = p.name || p.identity || (isLocal ? "You" : isAi ? "AI Interviewer" : "Guest");

    const audioPubs = ((p as any).audioTracks ?? []) as any[];
    const videoPubs = ((p as any).videoTracks ?? []) as any[];
    const hasAudio = audioPubs.some((pub) => !pub.isMuted);
    const hasVideo = videoPubs.some((pub) => !pub.isMuted);

    return {
      id: p.sid,
      name,
      role: (isLocal ? "candidate" : isAi ? "ai" : "other") as
        | "candidate"
        | "ai"
        | "other",
      isLocal,
      isSpeaking: p.isSpeaking,
      hasAudio,
      hasVideo,
      video: isLocal ? <UserVideo /> : undefined,
    };
  });

  // Only show tiles for actual participants (no placeholder)
  const tiles = participantTiles;

  return (
    <>
    <InterviewLayout
      roomLabel={roomName}
      roundLabel={targetRole ? `${targetRole} Interview` : "AI Practice Interview"}
      elapsedTime={elapsedTime}
      tiles={tiles}
      micOn={micOn}
      camOn={camOn}
      ccOn={ccOn}
      settingsOpen={settingsOpen}
      subtitleItems={subtitles}
      onToggleMic={handleToggleMic}
      onToggleCam={handleToggleCam}
      onToggleCc={() => setCcOn((prev) => !prev)}
      onOpenSettings={() => setSettingsOpen(true)}
      onCloseSettings={() => setSettingsOpen(false)}
      micDevices={micDevices.map((d) => ({
        id: d.deviceId,
        label: d.label || "Microphone",
      }))}
      cameraDevices={cameraDevices.map((d) => ({
        id: d.deviceId,
        label: d.label || "Camera",
      }))}
      speakerDevices={speakerDevices.map((d) => ({
        id: d.deviceId,
        label: d.label || "Speakers",
      }))}
      selectedMicId={selectedMicId}
      selectedCameraId={selectedCameraId}
      selectedSpeakerId={selectedSpeakerId}
      onSelectMicDevice={handleMicDeviceChange}
      onSelectCameraDevice={handleCameraDeviceChange}
      onSelectSpeakerDevice={handleSpeakerDeviceChange}
      onEndCall={handleEndCallRequest}
      showEndConfirmDialog={showEndConfirm}
      onEndConfirm={handleEndCallConfirm}
      onEndCancel={handleEndCallCancel}
      endingSession={endingSession}
    />
    </>
  );
}

function UserVideo() {
  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks[0];

  if (!cameraTrack) {
    return <div className="h-full w-full bg-slate-900" />;
  }

  return <VideoTrack trackRef={cameraTrack} />;
}
