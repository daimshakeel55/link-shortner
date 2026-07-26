import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import {
  aggregateByField,
  buildTimeSeries,
  countUniqueVisitors,
  getDateRangeFilter,
} from "@/lib/analytics";
import { getDemoLinks } from "@/lib/demo-store";
import type { ClickEvent } from "@/types/database";

const EVENTS_PAGE_SIZE = 1000;

async function fetchAllClickEvents(
  supabase: ReturnType<typeof getDatabaseClient>,
  linkIds: string[],
  since: string
) {
  const allEvents: ClickEvent[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("click_events")
      .select("*")
      .in("link_id", linkIds)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .range(from, from + EVENTS_PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    allEvents.push(...data);
    if (data.length < EVENTS_PAGE_SIZE) break;
    from += EVENTS_PAGE_SIZE;
  }

  return allEvents;
}

export async function GET(request: Request) {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "daily") as
    | "daily"
    | "weekly"
    | "monthly";
  const linkId = searchParams.get("linkId");

  if (session.isDemo) {
    const links = getDemoLinks(session.id);
    const topLinks = links.slice(0, 10).map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      click_count: l.click_count,
    }));
    const totalClicks = links.reduce((sum, l) => sum + l.click_count, 0);

    return NextResponse.json({
      totalClicks,
      allTimeClicks: totalClicks,
      uniqueVisitors: totalClicks,
      timeSeries: [],
      countries: [],
      cities: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      referrers: [],
      topLinks,
    });
  }

  let supabase;
  try {
    supabase = getDatabaseClient();
  } catch (error) {
    console.error("Analytics database error:", error);
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  const since = getDateRangeFilter(period).toISOString();

  const { data: userLinks } = await supabase
    .from("links")
    .select("id, slug, title, click_count")
    .eq("user_id", session.id)
    .order("click_count", { ascending: false });

  const allLinks = userLinks ?? [];
  const topLinks = allLinks.slice(0, 10);
  const linkIds = linkId ? [linkId] : allLinks.map((l) => l.id);
  const allTimeClicks = allLinks.reduce((sum, l) => sum + l.click_count, 0);

  if (linkIds.length === 0) {
    return NextResponse.json({
      totalClicks: 0,
      allTimeClicks: 0,
      uniqueVisitors: 0,
      timeSeries: [],
      countries: [],
      cities: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      referrers: [],
      topLinks: [],
    });
  }

  let allEvents: ClickEvent[] = [];

  try {
    allEvents = await fetchAllClickEvents(supabase, linkIds, since);
  } catch (error) {
    console.error("Analytics events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    totalClicks: allEvents.length,
    allTimeClicks,
    uniqueVisitors: countUniqueVisitors(allEvents),
    timeSeries: buildTimeSeries(allEvents, period),
    countries: aggregateByField(allEvents, "country"),
    cities: aggregateByField(allEvents, "city"),
    devices: aggregateByField(allEvents, "device"),
    browsers: aggregateByField(allEvents, "browser"),
    operatingSystems: aggregateByField(allEvents, "os"),
    referrers: aggregateByField(allEvents, "referrer"),
    topLinks,
  });
}
