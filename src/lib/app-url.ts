function normalizeUrl(url: string) {
  return url.trim().replace(/\/$/, "");
}

function hostFromDomain(domain: string) {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Public app URL — never a per-deployment Vercel URL like
 * link-shortner-hzgm-pm13qirt4-daim1.vercel.app
 */
export function getServerAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return normalizeUrl(configured);
  }

  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionDomain) {
    return `https://${hostFromDomain(productionDomain)}`;
  }

  // Available on every Vercel deployment — resolves to the public alias
  // e.g. link-shortner-hzgm → https://link-shortner-hzgm.vercel.app
  const projectName = process.env.VERCEL_PROJECT_NAME;
  if (projectName && process.env.VERCEL === "1") {
    return `https://${projectName}.vercel.app`;
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

export function isPrivateVercelDeployHost(hostname: string) {
  // Public:   link-shortner-hzgm.vercel.app
  // Private:  link-shortner-hzgm-pm13qirt4-daim1.vercel.app
  return /-daim1\.vercel\.app$/i.test(hostname);
}
