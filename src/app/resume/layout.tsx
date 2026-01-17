import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile | Panelroom",
  description: "Build and manage your professional profile for personalized AI interview practice. Upload your resume or enter details manually.",
  robots: {
    index: false, // Profile pages should not be indexed
    follow: false,
  },
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
