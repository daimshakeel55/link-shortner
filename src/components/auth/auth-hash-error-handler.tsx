"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function readHashAuthError() {
  if (typeof window === "undefined" || !window.location.hash) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const description = params.get("error_description");
  const code = params.get("error_code");
  const error = params.get("error");

  if (!description && !code && !error) {
    return null;
  }

  return description ?? code ?? error ?? "Authentication failed";
}

/** Handles Supabase auth errors in URL hash (not visible to server middleware). */
export function AuthHashErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    const message = readHashAuthError();
    if (!message) {
      return;
    }

    const target = new URL("/register", window.location.origin);
    target.searchParams.set("error", message);
    router.replace(`${target.pathname}${target.search}`);
  }, [router]);

  return null;
}
