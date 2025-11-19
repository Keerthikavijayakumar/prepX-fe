import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "Back to home" }: BackButtonProps) {
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
