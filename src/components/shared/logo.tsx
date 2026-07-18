import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/sharkvault-logo.png"
        alt={`${APP_NAME} logo`}
        width={36}
        height={36}
        className="size-9 shrink-0 object-contain"
        priority
      />
      {showText && (
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      )}
    </Link>
  );
}
