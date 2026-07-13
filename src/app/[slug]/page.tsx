import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { RESERVED_SLUGS } from "@/lib/constants";
import { extractRequestMetadata, parseUserAgent } from "@/lib/analytics";
import { hashIp } from "@/lib/slug";
import { PasswordGate } from "@/components/links/password-gate";
import {
  getDemoLinkBySlug,
  incrementDemoClick,
} from "@/lib/demo-store";

interface SlugPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ verified?: string }>;
}

async function trackSupabaseClick(linkId: string, headersList: Headers) {
  const metadata = extractRequestMetadata(headersList);
  const ua = metadata.userAgent
    ? parseUserAgent(metadata.userAgent)
    : { browser: "Unknown", os: "Unknown", device: "desktop" };

  const visitorId = metadata.ip ? hashIp(metadata.ip) : crypto.randomUUID();
  const supabase = await createClient();

  await supabase.from("click_events").insert({
    link_id: linkId,
    visitor_id: visitorId,
    ip_hash: metadata.ip ? hashIp(metadata.ip) : null,
    country: metadata.country ?? null,
    city: metadata.city ?? null,
    device: ua.device,
    browser: ua.browser,
    os: ua.os,
    referrer: metadata.referer,
  });

  await supabase.rpc("increment_click_count", { link_uuid: linkId });
}

export default async function SlugPage({
  params,
  searchParams,
}: SlugPageProps) {
  const { slug } = await params;
  const { verified } = await searchParams;

  if (RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number])) {
    notFound();
  }

  const demoLink = getDemoLinkBySlug(slug);

  if (demoLink) {
    if (demoLink.expires_at && new Date(demoLink.expires_at) < new Date()) {
      notFound();
    }
    if (demoLink.password_hash && verified !== "true") {
      return <PasswordGate slug={slug} />;
    }
    incrementDemoClick(slug);
    redirect(demoLink.original_url);
  }

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const supabase = await createClient();
  const { data: link } = await supabase
    .from("links")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!link) {
    notFound();
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    notFound();
  }

  if (link.password_hash && verified !== "true") {
    return <PasswordGate slug={slug} />;
  }

  const headersList = await headers();
  await trackSupabaseClick(link.id, headersList);

  redirect(link.original_url);
}
