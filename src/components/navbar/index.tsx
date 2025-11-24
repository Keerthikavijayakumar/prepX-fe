"use client";

import Link from "next/link";
import { NavbarUserControls } from "@/components/navbar/user-controls";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        {/* Logo / brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <span className="text-lg font-semibold">DM</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              DevMock<span className="text-primary">.ai</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Enterprise AI Mock Interviews
            </span>
          </div>
        </Link>

        {/* Primary nav (mirrors MainNavbar links) */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#system-design"
            className="transition-colors hover:text-foreground"
          >
            System Design
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="#enterprise"
            className="transition-colors hover:text-foreground"
          >
            Enterprise
          </Link>
        </nav>

        {/* User controls (auth + theme + profile) */}
        <NavbarUserControls />
      </div>
    </header>
  );
}
