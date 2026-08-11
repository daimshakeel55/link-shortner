import { UAParser } from "ua-parser-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClickEvent, Database } from "@/types/database";
import type { AnalyticsBreakdown, TimeSeriesPoint } from "@/types";

interface RequestMetadata {
  userAgent: string | null;
  referer: string | null;
  ip: string | null;
  country?: string | null;
  city?: string | null;
}

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    browser: browser.name ? `${browser.name}${browser.version ? ` ${browser.major}` : ""}` : "Unknown",
    os: os.name ? `${os.name}${os.version ? ` ${os.version}` : ""}` : "Unknown",
    device: device.type ?? "desktop",
  };
}

export function extractRequestMetadata(headers: Headers): RequestMetadata {
  const userAgent = headers.get("user-agent");
  const referer = headers.get("referer");
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null;
  const country = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry");
  const city = headers.get("x-vercel-ip-city");

  return { userAgent, referer, ip, country, city };
}

export function aggregateByField(
  events: ClickEvent[],
  field: keyof Pick<ClickEvent, "country" | "city" | "device" | "browser" | "os" | "referrer">
): AnalyticsBreakdown[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    const value = event[field] ?? "Unknown";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function buildTimeSeries(
  events: ClickEvent[],
  period: "daily" | "weekly" | "monthly"
): TimeSeriesPoint[] {
  const grouped = new Map<string, { clicks: number; visitors: Set<string> }>();

  for (const event of events) {
    const date = new Date(event.created_at);
    let key: string;

    if (period === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (period === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = grouped.get(key) ?? { clicks: 0, visitors: new Set<string>() };
    existing.clicks += 1;
    if (event.visitor_id) existing.visitors.add(event.visitor_id);
    grouped.set(key, existing);
  }

  return Array.from(grouped.entries())
    .map(([date, data]) => ({
      date,
      clicks: data.clicks,
      visitors: data.visitors.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function countUniqueVisitors(events: ClickEvent[]): number {
  const visitors = new Set<string>();
  for (const event of events) {
    if (event.visitor_id) visitors.add(event.visitor_id);
  }
  return visitors.size;
}

const VISITOR_PAGE_SIZE = 1000;

export async function countUniqueVisitorsFromDb(
  supabase: SupabaseClient<Database>,
  linkIds: string[]
): Promise<number> {
  if (linkIds.length === 0) return 0;

  const { data: rpcCount, error: rpcError } = await supabase.rpc(
    "get_unique_visitor_count",
    { link_uuids: linkIds }
  );

  if (!rpcError && rpcCount != null) {
    return Number(rpcCount);
  }

  const visitors = new Set<string>();
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("click_events")
      .select("visitor_id")
      .in("link_id", linkIds)
      .not("visitor_id", "is", null)
      .range(from, from + VISITOR_PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      if (row.visitor_id) visitors.add(row.visitor_id);
    }

    if (data.length < VISITOR_PAGE_SIZE) break;
    from += VISITOR_PAGE_SIZE;
  }

  return visitors.size;
}

export function getDateRangeFilter(period: "daily" | "weekly" | "monthly"): Date {
  const now = new Date();
  if (period === "daily") {
    now.setDate(now.getDate() - 30);
  } else if (period === "weekly") {
    now.setDate(now.getDate() - 90);
  } else {
    now.setMonth(now.getMonth() - 12);
  }
  return now;
}
