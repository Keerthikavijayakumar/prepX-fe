"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/sign-in", "/privacy-policy"] as const;

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/sign-in"] as const;

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}?`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}?`)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const parseUser = useCallback((supabaseUser: User | null): AuthUser | null => {
    if (!supabaseUser) return null;

    const meta = supabaseUser.user_metadata ?? {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? null,
      name: meta.display_name ?? meta.name ?? meta.full_name ?? null,
      avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      setUser(parseUser(data.user));
    }
  }, [parseUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push("/");
  }, [router]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Auth init error:", error);
          setIsLoading(false);
          return;
        }

        const currentSession = data.session;
        setSession(currentSession);
        setUser(parseUser(currentSession?.user ?? null));

        // Handle route protection
        const isPublic = isPublicRoute(pathname);
        const isAuth = isAuthRoute(pathname);

        if (currentSession) {
          // User is authenticated
          if (isAuth) {
            // Redirect away from auth pages if already logged in
            router.replace("/dashboard");
            return;
          }
        } else {
          // User is not authenticated
          if (!isPublic) {
            // Redirect to sign-in for protected routes
            router.replace("/sign-in");
            return;
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(parseUser(newSession?.user ?? null));

      if (event === "SIGNED_IN" && newSession) {
        // User just signed in
        if (isAuthRoute(pathname)) {
          router.replace("/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        // User signed out
        if (!isPublicRoute(pathname)) {
          router.replace("/sign-in");
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router, parseUser]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signOut,
    signInWithGoogle,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
