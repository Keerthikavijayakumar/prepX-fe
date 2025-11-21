"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function StartInterviewButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="btn btn-primary"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Preparing interview..." : "Start Mock Interview"}
    </button>
  );
}
