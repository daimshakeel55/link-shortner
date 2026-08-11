"use client";

import { useEffect, useState } from "react";
import { LinkButton } from "@/components/shared/link-button";

export function LandingAuthNav({ variant }: { variant: "desktop" | "mobile" }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const isMobile = variant === "mobile";

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        setIsSignedIn(response.ok);
      } catch {
        setIsSignedIn(false);
      }
    })();
  }, []);

  if (isSignedIn) {
    if (isMobile) {
      return (
        <div className="flex flex-col gap-2 pt-2">
          <LinkButton href="/dashboard">Go to Dashboard</LinkButton>
        </div>
      );
    }

    return (
      <LinkButton href="/dashboard" size="sm">
        Go to Dashboard
      </LinkButton>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        <LinkButton href="/login" variant="outline">
          Log in
        </LinkButton>
        <LinkButton href="/register">Get Started</LinkButton>
      </div>
    );
  }

  return (
    <>
      <LinkButton href="/login" variant="ghost" size="sm">
        Log in
      </LinkButton>
      <LinkButton href="/register" size="sm">
        Get Started
      </LinkButton>
    </>
  );
}
