"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavbarUserControls } from "@/components/navbar/user-controls";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/interview")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        {/* Logo / brand */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-light.png"
            alt="Talentflow logo"
            width={120}
            height={30}
            className="block h-[30px] w-auto dark:hidden"
          />
          <Image
            src="/logo-light.png"
            alt="Talentflow logo"
            width={120}
            height={30}
            className="hidden h-[30px] w-auto dark:block"
          />
        </Link>

        {/* Primary nav + beta badge */}
        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="transition-colors hover:text-foreground"
            >
              Pricing (Free)
            </Link>
          </nav>
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-500"
          >
            Free during beta
          </Badge>
        </div>

        {/* User controls (auth + theme + profile) */}
        <NavbarUserControls />
      </div>
    </header>
  );
}
