"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

interface InterviewPageProps {
  params: Promise<{
    room: string;
  }>;
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const router = useRouter();
  const { room } = use(params);

  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex items-center justify-center min-h-screen">
        <p>Connecting to your AI interview...</p>
      </div>
    );
  }

  if (error || !token || !wsUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>Failed to start interview: {error || "Missing LiveKit config"}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => router.push("/dashboard")}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
