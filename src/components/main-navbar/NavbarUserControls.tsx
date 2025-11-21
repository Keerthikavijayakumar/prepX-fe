"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { StartInterviewButton } from "@/components/start-interview-button";
import styles from "./MainNavbar.module.css";

type NavbarUser = {
  name: string | null;
  email: string | null;
};

export function NavbarUserControls() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<NavbarUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncUserFromAuth() {
      const { data, error } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error || !data.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const rawUser: any = data.user;
      const meta = rawUser.user_metadata ?? {};
      const name = (meta.display_name ?? meta.name ?? null) as string | null;
      const email = (rawUser.email ?? null) as string | null;

      setUser({ name, email });
      setLoading(false);
    }

    syncUserFromAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const sessionUser: any | null = session?.user ?? null;

      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const meta = sessionUser.user_metadata ?? {};
      const name = (meta.display_name ?? meta.name ?? null) as string | null;
      const email = (sessionUser.email ?? null) as string | null;

      setUser({ name, email });
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <StartInterviewButton />;
  }

  if (!user) {
    return <StartInterviewButton />;
  }

  const initial =
    user.name?.trim()?.charAt(0)?.toUpperCase() ??
    user.email?.trim()?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <div className={styles.userControls}>
      <Link href="/dashboard" className="btn btn-primary">
        Dashboard
      </Link>
      <Link
        href="/profile"
        className={styles.avatarButton}
        aria-label="Profile"
      >
        <span className={styles.avatarInitial}>{initial}</span>
      </Link>
    </div>
  );
}
