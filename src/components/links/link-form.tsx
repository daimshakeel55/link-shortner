"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createLinkSchema,
  type CreateLinkInput,
} from "@/lib/validations/link";
import { useCreateLink, useUpdateLink } from "@/hooks/use-links";
import type { Link } from "@/types/database";

interface LinkFormProps {
  link?: Link;
  mode?: "create" | "edit";
}

export function LinkForm({ link, mode = "create" }: LinkFormProps) {
  const router = useRouter();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLinkInput>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      originalUrl: link?.original_url ?? "",
      slug: link?.slug ?? "",
      isActive: link?.is_active ?? true,
    },
  });

  const isActive = watch("isActive");

  async function onSubmit(data: CreateLinkInput) {
    setLoading(true);
    try {
      if (mode === "edit" && link) {
        await updateLink.mutateAsync({ id: link.id, data });
        toast.success("Link updated");
      } else {
        await createLink.mutateAsync(data);
        toast.success("Link created");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glow-card p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="originalUrl">Paste your long URL</Label>
          <div className="relative">
            <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-purple-400" />
            <Input
              id="originalUrl"
              placeholder="https://example.com/your-long-url"
              className="h-12 pl-10"
              autoFocus
              {...register("originalUrl")}
            />
          </div>
          {errors.originalUrl && (
            <p className="text-xs text-destructive">{errors.originalUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Custom short link{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="slug"
            placeholder="my-link"
            className="h-11"
            {...register("slug")}
          />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>

        {mode === "edit" && (
          <div className="flex items-center justify-between rounded-xl border border-purple-500/15 p-4">
            <Label htmlFor="isActive">Link is active</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="glow-btn h-11 bg-gradient-to-r from-purple-600 to-violet-500 px-6"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {mode === "edit" ? "Save" : "Shorten"}
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
