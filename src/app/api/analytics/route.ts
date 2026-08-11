import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import {
  countPeriodClicksFromDb,
  countUniqueVisitorsFromDb,
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
    .select("id, slug, title, original_url, click_count")
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

  try {
    const [totalClicks, uniqueVisitors] = await Promise.all([
      countPeriodClicksFromDb(supabase, linkIds, since),
      countUniqueVisitorsFromDb(supabase, linkIds, since),
    ]);

    return NextResponse.json({
      totalClicks,
      allTimeClicks,
      uniqueVisitors,
      timeSeries: [],
      countries: [],
      cities: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      referrers: [],
      topLinks,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
