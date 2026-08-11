"use client";

import { useEffect, useRef, useState } from "react";
import { navigateAfterAuth } from "@/lib/auth/redirect";

function normalizeRedirectPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

/** Redirect already-signed-in users away from auth pages. */
export function useAuthenticatedRedirect(redirectPath: string) {
  const destination = normalizeRedirectPath(redirectPath);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;

    checkedRef.current = true;

    void (async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.ok) {
          setIsRedirecting(true);
          navigateAfterAuth(destination);
          return;
        }

        setIsSignedIn(false);
      } catch {
        setIsSignedIn(false);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [destination]);

  return { isLoaded, isSignedIn, isRedirecting };
}
