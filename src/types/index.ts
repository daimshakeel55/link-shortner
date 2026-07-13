import type { Link } from "./database";

export type {
  Database,
  Profile,
  Link,
  ClickEvent,
  ApiKey,
  LinkInsert,
  LinkUpdate,
} from "./database";

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueVisitors: number;
  topLinks: Array<{
    id: string;
    slug: string;
    title: string | null;
    click_count: number;
  }>;
}

export interface AnalyticsBreakdown {
  name: string;
  value: number;
}

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
  visitors: number;
}

export interface LinkWithShortUrl extends Link {
  shortUrl: string;
}

export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
