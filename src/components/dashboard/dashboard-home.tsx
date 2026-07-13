"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link2, MousePointerClick, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/copy-button";
import { ShortenWidget } from "@/components/links/shorten-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinks, useDeleteLink } from "@/hooks/use-links";
import { getShortUrl } from "@/lib/slug";

interface DashboardHomeProps {
  userName?: string;
  isDemo?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

export function DashboardHome({ userName, isDemo }: DashboardHomeProps) {
  const { data, isLoading, refetch } = useLinks({ page: 1 });
  const deleteLink = useDeleteLink();

  const links = data?.data ?? [];
  const totalClicks = links.reduce((sum, link) => sum + link.click_count, 0);

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
    <div className="space-y-8 p-6 md:p-8">
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <h1 className="text-2xl font-semibold tracking-tight">
          {userName ? (
            <>
              Hey,{" "}
              <span className="text-gradient-vibrant">
                {userName.split(" ")[0]}
              </span>
            </>
          ) : (
            "Shorten your links"
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a URL below to create a short link
        </p>
      </motion.div>

      <ShortenWidget />

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Link2, value: links.length, label: "Total links", color: "purple" },
          { icon: MousePointerClick, value: totalClicks, label: "Total clicks", color: "cyan" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial="hidden"
              animate="visible"
              custom={i + 1}
              variants={fadeUp}
              className="glow-card p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${
                    stat.color === "purple"
                      ? "bg-purple-500/20 ring-1 ring-purple-500/30"
                      : "bg-cyan-500/20 ring-1 ring-cyan-500/30"
                  }`}
                >
                  <Icon
                    className={`size-5 ${stat.color === "purple" ? "text-purple-300" : "text-cyan-300"}`}
                  />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
        <h2 className="mb-4 text-lg font-medium">Your links</h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="glow-card flex flex-col items-center justify-center py-12">
            <Link2 className="size-8 text-purple-400/60" />
            <p className="mt-3 text-sm text-muted-foreground">
              No links yet — shorten your first URL above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glow-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-purple-300">
                        {link.shortUrl ?? getShortUrl(link.slug)}
                      </p>
                      <CopyButton
                        value={link.shortUrl ?? getShortUrl(link.slug)}
                        size="sm"
                      />
                      <Badge
                        variant={link.is_active ? "default" : "secondary"}
                        className={link.is_active ? "bg-purple-600/80" : ""}
                      >
                        {link.is_active ? "Active" : "Off"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {link.original_url}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(link.created_at), {
                        addSuffix: true,
                      })}{" "}
                      · {link.click_count} clicks
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(link.id)}
                    aria-label="Delete link"
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
