"use client";

import { useAuthenticatedRedirect } from "@/lib/auth/use-authenticated-redirect";

/** Sends signed-in users from the landing page to the dashboard. */
export function HomeSignedInRedirect() {
  useAuthenticatedRedirect("/dashboard");
  return null;
}
