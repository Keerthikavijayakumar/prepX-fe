"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

type NavbarUser = {
  name: string | null;
  email: string | null;
};

export function NavbarUserControls() {
  const [authLoading, setAuthLoading] = useState(true);
  const [ctaLoading, setCtaLoading] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    async function syncUserFromAuth() {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (error || !data.user) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const rawUser: any = data.user;
      const meta = rawUser.user_metadata ?? {};
      const name = (meta.display_name ?? meta.name ?? null) as string | null;
      const email = (rawUser.email ?? null) as string | null;

      setUser({ name, email });
      setAuthLoading(false);
    }

    syncUserFromAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const sessionUser: any | null = session?.user ?? null;
      if (!sessionUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const meta = sessionUser.user_metadata ?? {};
      const name = (meta.display_name ?? meta.name ?? null) as string | null;
      const email = (sessionUser.email ?? null) as string | null;

      setUser({ name, email });
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleStartInterview() {
    if (ctaLoading) return;
    setCtaLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/sign-in");
      }
    } finally {
      setCtaLoading(false);
    }
  }

  const themeButton = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="h-8 w-8 rounded-full"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );

  if (authLoading) {
    return (
      <div className="flex items-center gap-3">
        <Button size="sm" disabled>
          Loading...
        </Button>
        {themeButton}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleStartInterview} disabled={ctaLoading}>
          Start practicing
        </Button>
        {themeButton}
      </div>
    );
  }

  const initial =
    user.name?.trim()?.charAt(0)?.toUpperCase() ??
    user.email?.trim()?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <div className="flex items-center gap-3">
      <Button asChild size="sm" className="text-xs">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      {themeButton}
      <Link
        href="/profile"
        aria-label="Profile"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
      >
        {initial}
      </Link>
    </div>
  );
}
