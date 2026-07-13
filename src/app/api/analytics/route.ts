import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateByField,
  buildTimeSeries,
  countUniqueVisitors,
  getDateRangeFilter,
} from "@/lib/analytics";
import { getDemoLinks } from "@/lib/demo-store";

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

  const supabase = await createClient();
  const since = getDateRangeFilter(period).toISOString();

  const { data: userLinks } = await supabase
    .from("links")
    .select("id, slug, title, click_count")
    .eq("user_id", session.id)
    .order("click_count", { ascending: false })
    .limit(10);

  const linkIds = linkId ? [linkId] : (userLinks ?? []).map((l) => l.id);

  if (linkIds.length === 0) {
    return NextResponse.json({
      totalClicks: 0,
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

  const { data: events } = await supabase
    .from("click_events")
    .select("*")
    .in("link_id", linkIds)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const allEvents = events ?? [];

  return NextResponse.json({
    totalClicks: allEvents.length,
    uniqueVisitors: countUniqueVisitors(allEvents),
    timeSeries: buildTimeSeries(allEvents, period),
    countries: aggregateByField(allEvents, "country"),
    cities: aggregateByField(allEvents, "city"),
    devices: aggregateByField(allEvents, "device"),
    browsers: aggregateByField(allEvents, "browser"),
    operatingSystems: aggregateByField(allEvents, "os"),
    referrers: aggregateByField(allEvents, "referrer"),
    topLinks: userLinks ?? [],
  });
}
