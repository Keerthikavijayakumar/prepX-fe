"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";

const ResumeProfile = dynamic(
  () => import("@/components/resume-profile").then((m) => m.ResumeProfile),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    ),
  }
);

export default function ResumeWorkspacePage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <ResumeProfile
        onComplete={() => {
          router.push("/dashboard");
        }}
      />
    </ProtectedRoute>
  );
}
