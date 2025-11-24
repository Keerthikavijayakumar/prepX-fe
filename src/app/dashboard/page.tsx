"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ResumeIntake } from "@/components/resume-intake";
import styles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState<boolean>(false);

  useEffect(() => {
    async function checkResumeStatus() {

          const { data } = await supabase.auth.getSession();
          console.log("Access" , data.session?.access_token);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profileData } = await supabase
            .from("users")
            .select("resume_id")
            .eq("id", user.id)
            .single();

          setHasResume(!!profileData?.resume_id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error checking resume status:", err);
        setLoading(false);
      }
    }

    checkResumeStatus();
  }, []);

  const handleStartInterview = () => {
    // Simple room id for now; can switch to UUID later
    const roomId = `interview_${Date.now()}`;
    router.push(`/interview/${roomId}`);
  };

  return (
    <div>
      <main className={styles.dashboardPage}>
        <div className={`container ${styles.dashboardContainer}`}>
          {loading ? (
            <div className={styles.loading}>
              <p>Loading...</p>
            </div>
          ) : (
            <div className={styles.dashboardContent}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartInterview}
              >
                Start Mock Interview
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
