"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, ArrowRight, LogOut, Settings } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavbarUserControlsProps {
  currentPath?: string;
  compact?: boolean;
}

function NavbarUserControlsComponent({ currentPath = "/", compact = false }: NavbarUserControlsProps) {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const isProfile = currentPath.startsWith("/profile");

  const themeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="h-9 w-9 rounded-full hover:bg-accent transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );

  if (authLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        {themeButton}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/sign-in")}
        >
          Sign In
        </Button>
        <Button
          size="sm"
          onClick={() => router.push("/sign-in")}
          className="group bg-foreground text-background hover:bg-foreground/90"
        >
          Get Started
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
        {themeButton}
      </div>
    );
  }

  const initial =
    user.name?.trim()?.charAt(0)?.toUpperCase() ??
    user.email?.trim()?.charAt(0)?.toUpperCase() ??
    "?";

  const displayName = user.name || user.email?.split("@")[0] || "User";

  // Compact mode: just theme toggle and avatar dropdown
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {themeButton}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all",
                "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground",
                "hover:shadow-md hover:shadow-primary/25 hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              )}
            >
              {initial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-600 dark:text-red-400 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Full mode (mobile menu, landing page)
  return (
    <div className="flex items-center gap-3">
      {themeButton}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all",
              "bg-secondary/80 hover:bg-secondary",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
              )}
            >
              {initial}
            </span>
            <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/history" className="cursor-pointer">
              Interview History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="text-red-600 dark:text-red-400 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const NavbarUserControls = memo(NavbarUserControlsComponent);
