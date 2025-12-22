"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

export default function ComponentsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="container p-10 space-y-10">
      {/* Enterprise Navbar preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Enterprise Navbar</h2>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {isDark ? "Switch to light" : "Switch to dark"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          High-trust, enterprise-ready navigation bar using your global theme
          tokens. Use this as the base for the main app shell.
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Navbar />
        </div>
      </section>

      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Component Library</h1>
          <p className="text-sm text-muted-foreground">
            shadcn/ui Button variants used in Panelroom.io. Use this page as a
            reference when choosing button types and sizes.
          </p>
        </div>
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Button Variants</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Button Sizes</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon button">
            <span className="text-lg">★</span>
          </Button>
        </div>
      </section>

      {/* States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">States</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>
    </div>
  );
}
