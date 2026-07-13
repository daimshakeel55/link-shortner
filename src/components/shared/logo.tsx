import Link from "next/link";
import { Link2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
        <Link2 className="size-4 text-primary" />
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      )}
    </Link>
  );
}
