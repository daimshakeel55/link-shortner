"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/use-links";
import type { AnalyticsBreakdown, AnalyticsPeriod } from "@/types";

function BreakdownChart({
  title,
  data,
}: {
  title: string;
  data: AnalyticsBreakdown[];
}) {
  if (!data.length) {
    return (
      <div className="glow-card border-0 p-0">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data yet — share your links to see analytics
          </p>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="glow-card border-0 p-0">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" stroke="#A1A1AA" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#A1A1AA"
              fontSize={12}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </div>
  );
}

export function AnalyticsContent() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");
  const { data, isLoading } = useAnalytics(period);

  return (
    <>
      <DashboardHeader
        title="Analytics"
        description="Track clicks, visitors, and engagement across your links"
      >
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}
        >
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </DashboardHeader>

      <div className="space-y-6 p-6 md:p-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glow-card border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Clicks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-gradient-vibrant">
                      {data?.totalClicks?.toLocaleString() ?? 0}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glow-card border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Unique Visitors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-gradient-vibrant">
                      {data?.uniqueVisitors?.toLocaleString() ?? 0}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="glow-card border-0">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Clicks over time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.timeSeries?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.timeSeries}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                      />
                      <XAxis dataKey="date" stroke="#A1A1AA" fontSize={12} />
                      <YAxis stroke="#A1A1AA" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "#111111",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    No click data for this period
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <BreakdownChart title="Countries" data={data?.countries ?? []} />
              <BreakdownChart title="Devices" data={data?.devices ?? []} />
              <BreakdownChart title="Browsers" data={data?.browsers ?? []} />
              <BreakdownChart
                title="Operating Systems"
                data={data?.operatingSystems ?? []}
              />
              <BreakdownChart title="Referrers" data={data?.referrers ?? []} />
              <BreakdownChart title="Cities" data={data?.cities ?? []} />
            </div>

            {data?.topLinks?.length > 0 && (
              <Card className="glow-card border-0">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {link.title || link.slug}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                /{link.slug}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold">
                            {link.click_count} clicks
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
