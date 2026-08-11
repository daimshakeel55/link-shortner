"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { CopyButton } from "@/components/shared/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/use-links";
import { getShortUrl } from "@/lib/slug";
import type { AnalyticsPeriod } from "@/types";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 px-6 py-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}

export function AnalyticsContent() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");
  const { data, isLoading } = useAnalytics(period);

  return (
    <>
      <DashboardHeader title="Analytics" description="Overview of your link performance">
        <div className="w-full md:w-auto">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
            <TabsList variant="line" className="w-full min-w-max sm:w-auto">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </DashboardHeader>

      <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 md:p-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Stat label="Total clicks" value={data?.totalClicks ?? 0} />
              <Stat label="Unique visitors" value={data?.uniqueVisitors ?? 0} />
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 p-6">
              <p className="mb-4 text-base font-medium">Top links</p>
              {data?.topLinks?.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {data.topLinks.map(
                    (
                      link: {
                        id: string;
                        slug: string;
                        title: string | null;
                        original_url?: string;
                        click_count: number;
                      },
                      i: number
                    ) => {
                      const shortUrl = getShortUrl(link.slug);

                      return (
                      <div
                        key={link.id}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <span className="w-5 shrink-0 pt-0.5 text-sm text-muted-foreground">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-all text-sm font-medium sm:text-base">
                                {shortUrl}
                              </p>
                              <CopyButton value={shortUrl} />
                            </div>
                            {link.original_url && (
                              <p className="mt-1 break-all text-sm text-muted-foreground">
                                {link.original_url}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-base font-semibold tabular-nums">
                          {link.click_count.toLocaleString()} clicks
                        </span>
                      </div>
                    );
                    }
                  )}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No click data yet
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
