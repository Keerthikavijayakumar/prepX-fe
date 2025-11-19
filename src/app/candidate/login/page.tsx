"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Mail, Lock, Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// BackButton component inline
function BackButton({ href, label = "Back to home" }: { href: string; label?: string }) {
  return (
    <Link 
      href={href} 
      className="mb-6 md:hidden flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Link>
  );
}

// MainLayout component inline
function MainLayout({ 
  children, 
  icon, 
  appName = "TalentFlow",
  showMobileMenu = false
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  appName?: string;
  showMobileMenu?: boolean;
}) {
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

// Login Form component inline
function CandidateLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate form submission
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <Card className="border-secondary/10 shadow-lg transition-all hover:shadow-secondary/5">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 shadow-inner">
            <Users className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <CardTitle className="text-center text-3xl font-bold">Candidate Login</CardTitle>
        <CardDescription className="text-center text-lg">Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="your.name@example.com" 
                className="pl-10 transition-all focus:border-secondary" 
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link href="/candidate/forgot-password" className="text-xs text-secondary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                className="pl-10 transition-all focus:border-secondary" 
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-6 pb-8 pt-2">
          <Button 
            className="w-full transition-all" 
            size="lg" 
            variant="secondary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          <Separator className="my-2" />
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/candidate/register" className="text-secondary hover:underline font-medium transition-colors">
              Create a candidate account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

// Main page component
export default function Page() {
  return (
    <MainLayout 
      icon={<Users className="h-6 w-6 text-secondary" />} 
      appName="TalentFlow Candidate"
      showMobileMenu={true}
    >
      <div className="mx-auto w-full max-w-md px-4 sm:px-0">
        <BackButton href="/" />
        <div className="mb-8 text-center md:hidden">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your candidate account</p>
        </div>
        <CandidateLoginForm />
      </div>
    </MainLayout>
  );
}
