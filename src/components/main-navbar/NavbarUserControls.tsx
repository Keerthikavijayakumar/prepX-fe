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

type ThemeMode = "light" | "dark";

export function NavbarUserControls() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");

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

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem("theme");
    const initial: ThemeMode =
      stored === "light" || stored === "dark" ? (stored as ThemeMode) : "dark";

    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";

      if (typeof window !== "undefined" && typeof document !== "undefined") {
        if (next === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        window.localStorage.setItem("theme", next);
      }

      return next;
    });
  }

  if (loading) {
    return (
      <div className={styles.userControls}>
        <div className={styles.navButtonWrapper}>
          <StartInterviewButton />
        </div>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.userControls}>
        <div className={styles.navButtonWrapper}>
          <StartInterviewButton />
        </div>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>
    );
  }

  const initial =
    user.name?.trim()?.charAt(0)?.toUpperCase() ??
    user.email?.trim()?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <div className={styles.userControls}>
      <div className={styles.navButtonWrapper}>
        <Link href="/dashboard" className="btn btn-primary">
          Dashboard
        </Link>
      </div>
      <button
        type="button"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle color theme"
      >
        {theme === "dark" ? "Dark" : "Light"}
      </button>
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
