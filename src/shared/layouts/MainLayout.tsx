"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  appName?: string;
  showMobileMenu?: boolean;
}

export function MainLayout({ 
  children, 
  icon, 
  appName = "TalentFlow",
  showMobileMenu = false
}: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              {icon}
              <h1 className="text-xl font-bold">{appName}</h1>
            </Link>
          </div>
          
          {showMobileMenu && (
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile menu */}
        {showMobileMenu && mobileMenuOpen && (
          <div className="md:hidden border-t bg-card/95 py-4 px-4 animate-in slide-in-from-top">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="px-4 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/components" 
                className="px-4 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Components
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8 md:py-16 lg:py-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-4">© 2025 TalentFlow. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/components" className="hover:text-foreground hover:underline transition-colors">View Components</Link>
            <Link href="#" className="hover:text-foreground hover:underline transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground hover:underline transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
