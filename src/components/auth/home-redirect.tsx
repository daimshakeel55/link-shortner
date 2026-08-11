"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/** Hard redirect to dashboard — avoids blank page from server redirect() on client nav. */
export function HomeRedirect() {
  useEffect(() => {
    window.location.replace("/dashboard");
  }, []);

  return (
    <main className="mesh-bg flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-label="Redirecting to dashboard" />
    </main>
  );
}
