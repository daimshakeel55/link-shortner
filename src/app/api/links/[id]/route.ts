import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { updateLinkSchema } from "@/lib/validations/link";
import { resolveShortUrl, hashPassword } from "@/lib/slug";
import type { Link, LinkUpdate } from "@/types/database";
import {
  deleteDemoLink,
  getDemoLinkById,
  getDemoLinkBySlug,
  updateDemoLink,
} from "@/lib/demo-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.isDemo) {
    const link = getDemoLinkById(session.id, id);
    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
    return NextResponse.json({ ...link, shortUrl: resolveShortUrl(link.slug, request) });
  }

  let supabase;
  try {
    supabase = getDatabaseClient();
  } catch (error) {
    console.error("Get link database error:", error);
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({ ...data, shortUrl: resolveShortUrl(data.slug, request) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateLinkSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  if (session.isDemo) {
    const updates: Partial<Link> = {};
    if (parsed.data.originalUrl) updates.original_url = parsed.data.originalUrl;
    if (parsed.data.slug) {
      const existing = getDemoLinkBySlug(parsed.data.slug);
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "This slug is already taken" },
          { status: 409 }
        );
      }
      updates.slug = parsed.data.slug;
    }
    if (parsed.data.title !== undefined) updates.title = parsed.data.title || null;
    if (parsed.data.description !== undefined)
      updates.description = parsed.data.description || null;
    if (parsed.data.password !== undefined) {
      updates.password_hash = parsed.data.password
        ? await hashPassword(parsed.data.password)
        : null;
    }
    if (parsed.data.expiresAt !== undefined)
      updates.expires_at = parsed.data.expiresAt || null;
    if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

    const data = updateDemoLink(session.id, id, updates);
    if (!data) {
      return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
    }
    return NextResponse.json({ ...data, shortUrl: resolveShortUrl(data.slug, request) });
  }

  let supabase;
  try {
    supabase = getDatabaseClient();
  } catch (error) {
    console.error("Update link database error:", error);
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  const updates: LinkUpdate = {};

  if (parsed.data.originalUrl) updates.original_url = parsed.data.originalUrl;
  if (parsed.data.slug) {
    const { data: existing } = await supabase
      .from("links")
      .select("id")
      .eq("slug", parsed.data.slug)
      .neq("id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 409 }
      );
    }
    updates.slug = parsed.data.slug;
  }
  if (parsed.data.title !== undefined) updates.title = parsed.data.title || null;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description || null;
  if (parsed.data.password !== undefined) {
    updates.password_hash = parsed.data.password
      ? await hashPassword(parsed.data.password)
      : null;
  }
  if (parsed.data.expiresAt !== undefined)
    updates.expires_at = parsed.data.expiresAt || null;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

  const { data, error } = await supabase
    .from("links")
    .update(updates)
    .eq("id", id)
    .eq("user_id", session.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }

  return NextResponse.json({ ...data, shortUrl: resolveShortUrl(data.slug, request) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.isDemo) {
    const deleted = deleteDemoLink(session.id, id);
    if (!deleted) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  let supabase;
  try {
    supabase = getDatabaseClient();
  } catch (error) {
    console.error("Delete link database error:", error);
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .eq("user_id", session.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
