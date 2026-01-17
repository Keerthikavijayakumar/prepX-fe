"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, History, User, Sparkles } from "lucide-react";
import { NavbarUserControls } from "@/components/navbar/user-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

// Navigation links for landing page
const LANDING_NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
] as const;

// Navigation links for authenticated users
const APP_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
] as const;

// Pages where navbar should be hidden
const HIDDEN_NAVBAR_PATHS = ["/interview"] as const;

function NavbarComponent() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine page context
  const isInterviewPage = HIDDEN_NAVBAR_PATHS.some(path => pathname.startsWith(path));
  const isLandingPage = pathname === "/";
  const showAppNav = isAuthenticated && !isLandingPage;

  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide navbar on interview pages
  if (isInterviewPage) {
    return null;
  }

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Main Navbar - Fixed position, consistent across all pages */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-background/60 backdrop-blur-md border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left: Logo */}
            <div className="flex items-center gap-8">
              <Link 
                href="/" 
                className="flex items-center shrink-0 group"
              >
                <div className="relative h-9 w-[140px] transition-transform duration-200 group-hover:scale-[1.02]">
                  <Image
                    src="/brand/logo-v3-light.svg"
                    alt="Panelroom"
                    fill
                    className="object-contain object-left block dark:hidden"
                    priority
                  />
                  <Image
                    src="/brand/logo-v3-dark.svg"
                    alt="Panelroom"
                    fill
                    className="object-contain object-left hidden dark:block"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              {showAppNav && (
                <nav className="hidden lg:flex items-center gap-1">
                  {APP_NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = isActiveLink(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "group relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-primary" : "group-hover:text-primary/70"
                        )} />
                        {link.label}
                        {/* Active indicator line */}
                        <span
                          className={cn(
                            "absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-200",
                            isActive
                              ? "bg-primary"
                              : "bg-transparent group-hover:bg-muted-foreground/30"
                          )}
                        />
                      </Link>
                    );
                  })}
                </nav>
              )}

              {/* Landing page nav */}
              {isLandingPage && (
                <nav className="hidden md:flex items-center gap-1">
                  {LANDING_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Badge
                    variant="outline"
                    className="ml-2 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
                  >
                    Beta
                  </Badge>
                </nav>
              )}
            </div>

            {/* Right: User Controls */}
            <div className="flex items-center gap-3">
              {/* Start Interview CTA - for authenticated users not on dashboard */}
              {showAppNav && pathname !== "/dashboard" && (
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30"
                >
                  <Link href="/dashboard?start=true">
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Start Interview
                  </Link>
                </Button>
              )}

              <div className="hidden md:block">
                <NavbarUserControls currentPath={pathname} compact={showAppNav} />
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <span
                    className={cn(
                      "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-200",
                      mobileMenuOpen ? "top-[9px] rotate-45" : "top-1"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-[9px] block h-0.5 w-5 bg-current transition-all duration-200",
                      mobileMenuOpen ? "opacity-0" : "opacity-100"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-200",
                      mobileMenuOpen ? "top-[9px] -rotate-45" : "top-[17px]"
                    )}
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          mobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg transition-all duration-300",
            mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          )}
        >
          <nav className="px-4 py-3 space-y-1">
            {showAppNav ? (
              <>
                {APP_NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive
                          ? "bg-primary/10 text-foreground font-medium"
                          : "text-muted-foreground active:bg-muted"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive && "text-primary"
                      )} />
                      {link.label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
                <div className="pt-3 mt-3 border-t border-border/50">
                  <Link
                    href="/dashboard?start=true"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    Start Interview
                  </Link>
                </div>
              </>
            ) : (
              <>
                {LANDING_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-muted-foreground active:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
            
            <div className="pt-3 mt-3 border-t border-border/50">
              <NavbarUserControls currentPath={pathname} />
            </div>
          </nav>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}

// Memoize navbar to prevent unnecessary re-renders
export const Navbar = memo(NavbarComponent);
