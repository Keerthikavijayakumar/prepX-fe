"use client";

import { Users } from "lucide-react";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { BackButton } from "@/shared/components/BackButton";
import { CandidateLoginForm } from "@/modules/candidate/components/CandidateLoginForm";

export default function CandidateLoginPage() {
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
