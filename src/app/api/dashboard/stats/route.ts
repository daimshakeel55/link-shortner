import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { countUniqueVisitorsFromDb } from "@/lib/analytics";
import { getDemoLinks } from "@/lib/demo-store";

export async function GET() {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.isDemo) {
    const links = getDemoLinks(session.id);
    const totalViews = links.reduce((sum, link) => sum + link.click_count, 0);

    return NextResponse.json({
      totalLinks: links.length,
      totalViews,
      uniqueVisitors: totalViews,
    });
  }

  let supabase;
  try {
    supabase = getDatabaseClient();
  } catch (error) {
    console.error("Dashboard stats database error:", error);
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  const { data: links, error } = await supabase
    .from("links")
    .select("id, click_count")
    .eq("user_id", session.id);

  if (error) {
    console.error("Dashboard stats links error:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }

  const allLinks = links ?? [];
  const linkIds = allLinks.map((link) => link.id);
  const totalViews = allLinks.reduce((sum, link) => sum + link.click_count, 0);

  let uniqueVisitors = 0;

  if (linkIds.length > 0) {
    try {
      uniqueVisitors = await countUniqueVisitorsFromDb(supabase, linkIds);
    } catch (error) {
      console.error("Dashboard unique visitors error:", error);
    }
  }

  return NextResponse.json({
    totalLinks: allLinks.length,
    totalViews,
    uniqueVisitors,
  });
}
