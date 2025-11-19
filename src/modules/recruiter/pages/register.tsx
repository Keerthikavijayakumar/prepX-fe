"use client";

import { Briefcase } from "lucide-react";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { BackButton } from "@/shared/components/BackButton";
import { RecruiterRegisterForm } from "@/modules/recruiter/components/RecruiterRegisterForm";

export default function RecruiterRegisterPage() {
  return (
    <MainLayout 
      icon={<Briefcase className="h-6 w-6 text-primary" />} 
      appName="TalentFlow Recruiter"
      showMobileMenu={true}
    >
      <div className="mx-auto w-full max-w-md px-4 sm:px-0">
        <BackButton href="/" />
        <div className="mb-8 text-center md:hidden">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">Join as a recruiter to find top talent</p>
        </div>
        <RecruiterRegisterForm />
      </div>
    </MainLayout>
  );
}
