function normalizeUrl(url: string) {
  return url.trim().replace(/\/$/, "");
}

/** Public app URL for auth redirects — never use per-deployment Vercel URLs. */
export function getServerAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return normalizeUrl(configured);
  }

  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionDomain) {
    const host = productionDomain.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return null;
}

export function getAuthCallbackUrl() {
  const appUrl = getServerAppUrl();
  return appUrl ? `${appUrl}/auth/callback` : null;
}
