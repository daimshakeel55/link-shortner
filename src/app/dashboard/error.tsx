"use client";

import { useEffect } from "react";
import { LinkButton } from "@/components/shared/link-button";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard unavailable
        </h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while loading your dashboard. Try again, or sign
          in again if the problem continues.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try again</Button>
          <LinkButton href="/login?redirect=/dashboard" variant="outline">
            Sign in
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
