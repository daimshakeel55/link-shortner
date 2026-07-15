"use client";

import { Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/copy-button";
import { ShortenWidget } from "@/components/links/shorten-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics, useDeleteLink, useLinks } from "@/hooks/use-links";
import { getShortUrl } from "@/lib/slug";

interface DashboardHomeProps {
  userName?: string;
}

export function DashboardHome({ userName }: DashboardHomeProps) {
  const { data, isLoading, refetch } = useLinks({ page: 1 });
  const { data: analytics } = useAnalytics("daily");
  const deleteLink = useDeleteLink();

  const links = data?.data ?? [];
  const totalViews = links.reduce((sum, link) => sum + link.click_count, 0);

  async function handleDelete(id: string) {
    try {
      await deleteLink.mutateAsync(id);
      toast.success("Link deleted");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {userName ? (
            <>
              Hey,{" "}
              <span className="text-gradient-vibrant">
                {userName.split(" ")[0]}
              </span>
            </>
          ) : (
            "Dashboard"
          )}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Shorten links and track clicks
        </p>
      </div>

      <ShortenWidget />

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/50 px-6 py-5">
          <p className="text-sm text-muted-foreground">Links</p>
          <p className="mt-2 text-3xl font-semibold">{links.length}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/50 px-6 py-5">
          <p className="text-sm text-muted-foreground">Views</p>
          <p className="mt-2 text-3xl font-semibold">
            {(analytics?.totalClicks ?? totalViews).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/50 px-6 py-5">
          <p className="text-sm text-muted-foreground">Visitors</p>
          <p className="mt-2 text-3xl font-semibold">
            {(analytics?.uniqueVisitors ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-base font-medium">Your links</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
            <Link2 className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-base text-muted-foreground">
              No links yet — paste a URL above
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 rounded-xl border border-border/60">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-4 px-5 py-4 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-medium">
                      {link.shortUrl ?? getShortUrl(link.slug)}
                    </p>
                    <CopyButton
                      value={link.shortUrl ?? getShortUrl(link.slug)}
                    />
                    {!link.is_active && (
                      <Badge variant="secondary">Off</Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {link.original_url}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-semibold">{link.click_count}</p>
                  <p className="text-sm text-muted-foreground">views</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(link.id)}
                  aria-label="Delete link"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
