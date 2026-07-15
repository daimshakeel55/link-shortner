"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/use-links";
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
        <div className="w-full overflow-x-auto md:w-auto">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
            <TabsList className="w-full min-w-max sm:w-auto">
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
                        click_count: number;
                      },
                      i: number
                    ) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <span className="w-5 text-sm text-muted-foreground">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-base font-medium">
                              {link.title || link.slug}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              /{link.slug}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-base font-semibold">
                          {link.click_count} clicks
                        </span>
                      </div>
                    )
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
