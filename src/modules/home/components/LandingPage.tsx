"use client";

import Link from "next/link";
import { Briefcase, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/shared/layouts/MainLayout";

export function LandingPage() {
  return (
    <MainLayout 
      icon={
        <div className="flex">
          <Briefcase className="h-6 w-6 text-primary" />
          <Users className="h-6 w-6 text-secondary -ml-2" />
        </div>
      }
      showMobileMenu={true}
    >
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-3 duration-1000">
            Welcome to <span className="font-black">TalentFlow</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg md:text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Connecting top talent with leading organizations through our modern recruitment platform
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/recruiter/login">For Recruiters</Link>
            </Button>
            <Button size="lg" className="rounded-full px-8" variant="secondary" asChild>
              <Link href="/candidate/login">For Candidates</Link>
            </Button>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {/* Recruiter Card */}
          <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg border-primary/10 group">
            <CardHeader className="bg-primary/5 pb-8 group-hover:bg-primary/10 transition-colors">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-lg group-hover:shadow-primary/20 transition-all">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center text-2xl font-bold">Recruiter</CardTitle>
              <CardDescription className="text-center text-base">Post jobs and find the perfect candidates</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Post unlimited job listings</span>
                    <p className="text-sm">Create detailed job postings with custom requirements</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Advanced candidate filtering</span>
                    <p className="text-sm">Find the right talent with powerful search tools</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Interview scheduling tools</span>
                    <p className="text-sm">Streamline the hiring process with integrated calendars</p>
                  </div>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-muted/30 p-6">
              <Button className="w-full transition-all" size="lg" asChild>
                <Link href="/recruiter/login">
                  Login as Recruiter
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Candidate Card */}
          <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg border-secondary/10 group">
            <CardHeader className="bg-secondary/5 pb-8 group-hover:bg-secondary/10 transition-colors">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 shadow-lg group-hover:shadow-secondary/20 transition-all">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-center text-2xl font-bold">Candidate</CardTitle>
              <CardDescription className="text-center text-base">Find your dream job and advance your career</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Create professional profile</span>
                    <p className="text-sm">Showcase your skills and experience to employers</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Apply to jobs with one click</span>
                    <p className="text-sm">Streamlined application process saves you time</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Track application status</span>
                    <p className="text-sm">Stay updated on your job applications in real-time</p>
                  </div>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-muted/30 p-6">
              <Button className="w-full transition-all" size="lg" variant="secondary" asChild>
                <Link href="/candidate/login">
                  Login as Candidate
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 space-y-2 text-sm text-muted-foreground text-center">
          <p className="text-base">New to TalentFlow?</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/recruiter/register" className="font-medium text-primary hover:underline transition-colors">
              Register as Recruiter
            </Link>
            <span className="hidden md:inline">•</span>
            <Link href="/candidate/register" className="font-medium text-secondary hover:underline transition-colors">
              Register as Candidate
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
