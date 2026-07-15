import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { createLinkSchema } from "@/lib/validations/link";
import { generateSlug, getShortUrl, hashPassword } from "@/lib/slug";
import { rateLimit } from "@/lib/rate-limit";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import {
  createDemoLink,
  getDemoLinks,
  getDemoLinkBySlug,
} from "@/lib/demo-store";

function filterDemoLinks(
  userId: string,
  search: string,
  status: string | null,
  page: number,
  pageSize: number
) {
  let links = getDemoLinks(userId);

  if (search) {
    const q = search.toLowerCase();
    links = links.filter(
      (link) =>
        link.slug.toLowerCase().includes(q) ||
        link.original_url.toLowerCase().includes(q) ||
        link.title?.toLowerCase().includes(q)
    );
  }

  if (status === "active") links = links.filter((l) => l.is_active);
  if (status === "inactive") links = links.filter((l) => !l.is_active);

  const total = links.length;
  const from = (page - 1) * pageSize;
  const data = links.slice(from, from + pageSize).map((link) => ({
    ...link,
    shortUrl: getShortUrl(link.slug),
  }));

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");
  const pageSize = DEFAULT_PAGE_SIZE;

  if (session.isDemo) {
    return NextResponse.json(
      filterDemoLinks(session.id, search, status, page, pageSize)
    );
  }

  const supabase = await getDatabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("links")
    .select("*", { count: "exact" })
    .eq("user_id", session.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `slug.ilike.%${search}%,original_url.ilike.%${search}%,title.ilike.%${search}%`
    );
  }

  if (status === "active") query = query.eq("is_active", true);
  else if (status === "inactive") query = query.eq("is_active", false);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: (data ?? []).map((link) => ({ ...link, shortUrl: getShortUrl(link.slug) })),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`create-link:${session.id}`, {
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = createLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { originalUrl, slug, title, description, password, expiresAt, isActive } =
    parsed.data;

  const finalSlug = slug && slug.length > 0 ? slug : generateSlug();

  if (session.isDemo) {
    const existing = getDemoLinkBySlug(finalSlug);
    if (existing) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 409 }
      );
    }

    const passwordHash = password ? await hashPassword(password) : null;
    const link = createDemoLink(session.id, {
      original_url: originalUrl,
      slug: finalSlug,
      title: title || null,
      description: description || null,
      password_hash: passwordHash,
      expires_at: expiresAt || null,
      is_active: isActive ?? true,
    });

    return NextResponse.json(
      { ...link, shortUrl: getShortUrl(link.slug) },
      { status: 201 }
    );
  }

  const supabase = await getDatabaseClient();

  const { data: existing } = await supabase
    .from("links")
    .select("id")
    .eq("slug", finalSlug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken" },
      { status: 409 }
    );
  }

  const passwordHash = password ? await hashPassword(password) : null;

  const { data, error } = await supabase
    .from("links")
    .insert({
      user_id: session.id,
      original_url: originalUrl,
      slug: finalSlug,
      title: title || null,
      description: description || null,
      password_hash: passwordHash,
      expires_at: expiresAt || null,
      is_active: isActive ?? true,
    })
    .select()
    .single();

  if (error) {
    const message = error.message.includes("profiles")
      ? "Account setup incomplete. Sign out and sign in again."
      : error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(
    { ...data, shortUrl: getShortUrl(data.slug) },
    { status: 201 }
  );
}
