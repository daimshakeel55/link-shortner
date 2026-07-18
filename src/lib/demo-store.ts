import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import type { Link } from "@/types/database";

export const DEMO_COOKIE = "sharkvault_demo_user";

type DemoLink = Link;

const demoLinks = new Map<string, DemoLink[]>();

function getDemoUserId(userId: string): DemoLink[] {
  if (!demoLinks.has(userId)) {
    demoLinks.set(userId, []);
  }
  return demoLinks.get(userId)!;
}

export async function getDemoUserIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE)?.value ?? null;
}

export function isDemoUserId(userId: string | null): userId is string {
  return Boolean(userId?.startsWith("demo_"));
}

export function createDemoUserId(): string {
  return `demo_${nanoid(12)}`;
}

export function getDemoLinks(userId: string): DemoLink[] {
  return [...getDemoUserId(userId)].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getDemoLinkById(userId: string, id: string): DemoLink | undefined {
  return getDemoUserId(userId).find((link) => link.id === id);
}

export function getDemoLinkBySlug(slug: string): DemoLink | undefined {
  for (const links of demoLinks.values()) {
    const found = links.find((link) => link.slug === slug && link.is_active);
    if (found) return found;
  }
  return undefined;
}

export function createDemoLink(
  userId: string,
  data: {
    original_url: string;
    slug: string;
    title?: string | null;
    description?: string | null;
    password_hash?: string | null;
    expires_at?: string | null;
    is_active?: boolean;
  }
): DemoLink {
  const links = getDemoUserId(userId);
  const now = new Date().toISOString();

  const link: DemoLink = {
    id: nanoid(),
    user_id: userId,
    original_url: data.original_url,
    slug: data.slug,
    title: data.title ?? null,
    description: data.description ?? null,
    password_hash: data.password_hash ?? null,
    expires_at: data.expires_at ?? null,
    is_active: data.is_active ?? true,
    click_count: 0,
    created_at: now,
    updated_at: now,
  };

  links.unshift(link);
  return link;
}

export function updateDemoLink(
  userId: string,
  id: string,
  updates: Partial<DemoLink>
): DemoLink | null {
  const links = getDemoUserId(userId);
  const index = links.findIndex((link) => link.id === id);
  if (index === -1) return null;

  links[index] = {
    ...links[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return links[index];
}

export function deleteDemoLink(userId: string, id: string): boolean {
  const links = getDemoUserId(userId);
  const index = links.findIndex((link) => link.id === id);
  if (index === -1) return false;
  links.splice(index, 1);
  return true;
}

export function incrementDemoClick(slug: string): void {
  for (const links of demoLinks.values()) {
    const link = links.find((l) => l.slug === slug);
    if (link) {
      link.click_count += 1;
      return;
    }
  }
}
