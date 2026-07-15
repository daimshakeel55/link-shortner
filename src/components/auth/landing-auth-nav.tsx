"use client";

import { useEffect, useState } from "react";
import { LinkButton } from "@/components/shared/link-button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function GuestNav({ variant }: { variant: "desktop" | "mobile" }) {
  const isMobile = variant === "mobile";

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

function SignedInNav({ variant }: { variant: "desktop" | "mobile" }) {
  const isMobile = variant === "mobile";

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        <LinkButton href="/dashboard">Dashboard</LinkButton>
      </div>
    );
  }

  return (
    <LinkButton href="/dashboard" size="sm">
      Dashboard
    </LinkButton>
  );
}

export function LandingAuthNav({ variant }: { variant: "desktop" | "mobile" }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoaded(true);
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        setIsSignedIn(response.ok);
      } catch {
        setIsSignedIn(false);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  if (!isSupabaseConfigured() || !isLoaded) {
    return <GuestNav variant={variant} />;
  }

  if (isSignedIn) {
    return <SignedInNav variant={variant} />;
  }

  return <GuestNav variant={variant} />;
}
