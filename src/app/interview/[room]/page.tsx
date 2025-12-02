"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { supabase } from "@/lib/supabaseClient";

interface InterviewPageProps {
  params: Promise<{
    room: string;
  }>;
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const router = useRouter();
  const { room } = use(params);

  // LiveKit connection state
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
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

  // Fetch LiveKit token and server URL from backend
  useEffect(() => {
    async function setupLiveKit() {
      try {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
          router.push("/sign-in");
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          setError("Backend URL is not configured");
          setLoading(false);
          return;
        }

        const res = await fetch(`${backendUrl}/api/livekit/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ roomName: room }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || "Failed to fetch LiveKit token");
        }

        const json = await res.json();
        setToken(json.token);
        setWsUrl(json.wsUrl);
        setLoading(false);
      } catch (err: any) {
        console.error("Error setting up LiveKit:", err);
        setError(err.message || "Unknown error");
        setLoading(false);
      }
    }

    setupLiveKit();
  }, [room, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Connecting to your AI interview...
        </p>
      </div>
    );
  }

  if (error || !token || !wsUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-destructive">
          Failed to start interview: {error || "Missing LiveKit config"}
        </p>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <LiveKitRoom token={token} serverUrl={wsUrl} connect audio video>
      <RoomAudioRenderer />
      <StartAudio label="Enable audio" />
      <InterviewExperience
        roomName={room}
        onEndCall={() => router.push("/dashboard")}
      />
    </LiveKitRoom>
  );
}

function InterviewExperience({
  roomName,
  onEndCall,
}: {
  roomName: string;
  onEndCall: () => void;
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ccOn, setCcOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  type SubtitleEntry = { id: string; speaker: string; text: string };
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);

  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string | undefined>();
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>();
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | undefined>();

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
        if (!selectedSpeakerId && speakers[0]) setSelectedSpeakerId(speakers[0].deviceId);
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

  // Subscribe to LiveKit transcription text streams and drive subtitles
  useEffect(() => {
    if (!room) return;

    const handler = async (
      reader: any,
      info: { identity?: string } | undefined,
    ) => {
      try {
        const message = await reader.readAll();
        console.log("message", message);
        const attrs = reader.info?.attributes ?? {};
        console.log("attrs", attrs);
        const isTranscription = !!attrs["lk.transcribed_track_id"];
        const hasSegmentId = !!attrs["lk.segment_id"];
        // Some early or partial transcription events may not include
        // lk.transcribed_track_id but will still carry lk.segment_id.
        // Accept either so we don't drop the very first spoken line.
        if (!isTranscription && !hasSegmentId) return;

        const senderIdentity = info?.identity;
        const trackSid = attrs["lk.transcribed_track_id"] as string | undefined;
        let label = "";

        // Prefer matching by track ID to reliably detect the local candidate,
        // regardless of how identities are mapped.
        const localAudioPubs = ((localParticipant as any)?.audioTracks ?? []) as any[];
        const isLocalByTrack = !!trackSid && localAudioPubs.some((pub) => pub.trackSid === trackSid);

        if (isLocalByTrack) {
          label = "You";
        } else if (senderIdentity) {
          const participant = participants.find((p) => p.identity === senderIdentity);
          if (participant) {
            const baseName = participant.name || participant.identity || "Guest";
            label = participant.isLocal ? "You" : baseName;
          }
        }

        const segmentId = (attrs["lk.segment_id"] as string | undefined) ?? "";
        const id = segmentId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const text = typeof message === "string" ? message : String(message ?? "");
        const trimmedText = text.trim();

        setSubtitles((prev) => {
          const baseLabel = label || "";

          // If we already have an entry for this segment, update it instead of pushing a new one
          const existingIndex = segmentId
            ? prev.findIndex((s) => s.id === segmentId)
            : -1;

          if (existingIndex !== -1) {
            const next = [...prev];
            const current = next[existingIndex];
            const hasNewText = trimmedText.length > 0;

            next[existingIndex] = {
              ...current,
              speaker: baseLabel || current.speaker,
              // Do not wipe out existing text if this update carries empty/whitespace text
              text: hasNewText ? text : current.text,
            };
            return next;
          }

          // For new segments, skip completely empty/whitespace messages
          if (!trimmedText.length) {
            return prev;
          }

          const next = [...prev, { id, speaker: baseLabel, text }];
          // keep a small rolling history; actual UI decides which lines to show
          return next.slice(-20);
        });
      } catch (err) {
        console.error("Error handling transcription text stream", err);
      }
    };

    // 'lk.transcription' includes both user and agent STT/TTS output
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    room.registerTextStreamHandler?.("lk.transcription", handler);

    return () => {
      if (room && typeof (room as any).unregisterTextStreamHandler === "function") {
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

  const tiles = participants.map((p) => {
    const isLocal = p.isLocal;
    const isAi =
      p.identity === "ai-interviewer" ||
      (() => {
        if (!p.metadata) return false;
        try {
          const meta = JSON.parse(p.metadata as string);
          return meta?.kind === "ai-interview";
        } catch {
          return false;
        }
      })();

    const name = p.name || p.identity || (isLocal ? "You" : "Guest");

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

  return (
    <InterviewLayout
      roomLabel={roomName}
      roundLabel="Round 2: Technical"
      elapsedTime={"04:22"}
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
      onEndCall={onEndCall}
      micDevices={micDevices.map((d) => ({ id: d.deviceId, label: d.label || "Microphone" }))}
      cameraDevices={cameraDevices.map((d) => ({ id: d.deviceId, label: d.label || "Camera" }))}
      speakerDevices={speakerDevices.map((d) => ({ id: d.deviceId, label: d.label || "Speakers" }))}
      selectedMicId={selectedMicId}
      selectedCameraId={selectedCameraId}
      selectedSpeakerId={selectedSpeakerId}
      onSelectMicDevice={handleMicDeviceChange}
      onSelectCameraDevice={handleCameraDeviceChange}
      onSelectSpeakerDevice={handleSpeakerDeviceChange}
    />
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
