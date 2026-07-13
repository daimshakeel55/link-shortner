"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Link2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/shared/copy-button";
import { useCreateLink } from "@/hooks/use-links";
import type { LinkWithShortUrl } from "@/types";

export function ShortenWidget() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkWithShortUrl | null>(null);
  const createLink = useCreateLink();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const link = await createLink.mutateAsync({
        originalUrl: formattedUrl,
        slug: customSlug.trim() || undefined,
        isActive: true,
      });
      setCreatedLink(link);
      setUrl("");
      setCustomSlug("");
      toast.success("Link created!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create link");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glow-card p-6 md:p-8"
    >
      <div className="pointer-events-none absolute top-0 right-0 size-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-48 -translate-x-1/4 translate-y-1/4 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 ring-1 ring-purple-500/30"
          >
            <Sparkles className="size-5 text-purple-300" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold">Shorten a link</h2>
            <p className="text-sm text-muted-foreground">
              Paste your long URL and get a short link instantly
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-purple-400" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/my-long-url"
                className="h-12 border-primary/20 bg-background/50 pl-10 transition-all focus:border-primary/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
              />
            </div>
            <Input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="custom-slug (optional)"
              className="h-12 border-primary/20 bg-background/50 sm:w-48"
            />
            <Button
              type="submit"
              size="lg"
              className="glow-btn h-12 bg-gradient-to-r from-purple-600 to-violet-500 px-8 hover:from-purple-500 hover:to-violet-400"
              disabled={createLink.isPending}
            >
              {createLink.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Shorten
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {createdLink && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4"
              style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)" }}
            >
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <Check className="size-4" />
                Your link is ready
              </div>
              <div className="mt-3 flex items-center gap-2">
                <p className="flex-1 truncate font-medium text-gradient-vibrant">
                  {createdLink.shortUrl}
                </p>
                <CopyButton value={createdLink.shortUrl} />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                → {createdLink.original_url}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
