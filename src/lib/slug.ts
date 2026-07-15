import { customAlphabet } from "nanoid";
import { getServerAppUrl } from "@/lib/app-url";
import { RESERVED_SLUGS, SLUG_MIN_LENGTH } from "@/lib/constants";

const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  7
);

export function generateSlug(): string {
  return nanoid();
}

export function isValidSlug(slug: string): boolean {
  if (slug.length < SLUG_MIN_LENGTH || slug.length > 64) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return false;
  if (RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number])) return false;
  return true;
}

export function sanitizeSlug(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
}

function isVercelDeploymentHost(hostname: string) {
  return /-daim1\.vercel\.app$/i.test(hostname);
}

export function resolveShortUrl(slug: string, request?: Request) {
  const configured = getServerAppUrl();
  if (configured) {
    return `${configured}/${slug}`;
  }

  if (request) {
    const origin = new URL(request.url).origin;
    const hostname = new URL(origin).hostname;
    if (!isVercelDeploymentHost(hostname)) {
      return `${origin.replace(/\/$/, "")}/${slug}`;
    }
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (!isVercelDeploymentHost(hostname)) {
      return `${window.location.origin.replace(/\/$/, "")}/${slug}`;
    }
  }

  return `http://localhost:3000/${slug}`;
}

export function getShortUrl(slug: string) {
  return resolveShortUrl(slug);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

export function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
