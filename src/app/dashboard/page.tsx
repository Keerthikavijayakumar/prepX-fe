"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace("/sign-in");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  }

  return (
    <div>
      <main className="container" style={{ padding: "2rem 1rem" }}>
        {loading ? (
          <p>Loading your profile...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div>
            <h1>Dashboard</h1>
            <p>You are signed in as:</p>
            <pre
              style={{
                background: "#111827",
                color: "#e5e7eb",
                padding: "1rem",
                borderRadius: "0.5rem",
                overflowX: "auto",
                fontSize: "0.85rem",
              }}
            >
              {JSON.stringify(user, null, 2)}
            </pre>
            <button
              type="button"
              onClick={handleSignOut}
              style={{ marginTop: "1rem" }}
            >
              Sign out
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
