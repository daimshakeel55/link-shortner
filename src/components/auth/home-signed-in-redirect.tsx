"use client";

import { Loader2 } from "lucide-react";
import { useAuthenticatedRedirect } from "@/lib/auth/use-authenticated-redirect";

/** Fallback redirect when the client has a session the server did not detect. */
export function HomeSignedInRedirect() {
  const { isRedirecting } = useAuthenticatedRedirect("/dashboard");

  if (!isRedirecting) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" aria-label="Redirecting to dashboard" />
    </div>
  );
}
