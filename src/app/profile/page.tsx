"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./page.module.css";

type ProfileData = {
  name: string | null;
  email: string | null;
  createdAt: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/sign-in");
        return;
      }

      const user = data.user as any;
      const meta = user.user_metadata ?? {};

      let name: string | null = (meta.display_name ?? meta.name ?? null) as
        | string
        | null;
      let email: string | null = (user.email ?? null) as string | null;
      let createdAt: string | null = null;

      try {
        const { data: rows, error: profileError } = await supabase
          .from("users")
          .select("name, email, created_at")
          .eq("id", user.id)
          .limit(1);

        if (!profileError && rows && rows.length > 0) {
          const row = rows[0] as {
            name: string | null;
            email: string | null;
            created_at: string | null;
          };

          name = row.name ?? name;
          email = row.email ?? email;
          createdAt = row.created_at ?? null;
        }
      } catch (loadError) {
        console.error("Failed to load profile from users table", loadError);
      }

      setProfile({ name, email, createdAt });
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  }

  const displayInitial =
    profile?.name?.trim()?.charAt(0)?.toUpperCase() ??
    profile?.email?.trim()?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <div>
      <main className={styles.profilePage}>
        <div className={`container ${styles.profileContainer}`}>
          <section className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>{displayInitial}</div>
              <div className={styles.headerText}>
                <p className={styles.badge}>Profile</p>
                <h1>Your account</h1>
                <p className={styles.subtitle}>
                  Manage the core details your interviewer sees first.
                </p>
              </div>
            </div>

            {loading ? (
              <div className={styles.stateRow}>
                <p className={styles.muted}>Loading your profile...</p>
              </div>
            ) : error ? (
              <div className={styles.stateRow}>
                <p className={styles.error}>{error}</p>
              </div>
            ) : (
              <div className={styles.detailsGrid}>
                <div className={styles.detailGroup}>
                  <h2>Basic info</h2>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Name</span>
                    <span className={styles.value}>
                      {profile?.name || "Not set yet"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{profile?.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Member since</span>
                    <span className={styles.value}>
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString()
                        : "Just now"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailGroup}>
                  <h2>Interview context</h2>
                  <p className={styles.muted}>
                    Soon you&apos;ll be able to configure your target roles,
                    seniority level, and preferred companies here so every mock
                    interview feels tailored to a real on-site.
                  </p>
                </div>
              </div>
            )}
            <div className={styles.actionsRow}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
