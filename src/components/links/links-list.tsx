"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { LinkButton } from "@/components/shared/link-button";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLinks, useDeleteLink } from "@/hooks/use-links";

export function LinksPageContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);

  const { data, isLoading } = useLinks({
    page,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const deleteLink = useDeleteLink();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteLink.mutateAsync(deleteId);
      toast.success("Link deleted");
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  return (
    <>
      <DashboardHeader
        title="Links"
        description="Manage and track all your short links"
      >
        <LinkButton href="/dashboard/links/new" className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" />
          Create Link
        </LinkButton>
      </DashboardHeader>

      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              if (v) setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
            <p className="text-lg font-medium">No links found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Create your first link to get started"}
            </p>
            {!search && (
              <LinkButton href="/dashboard/links/new" className="mt-6">
                <Plus className="mr-2 size-4" />
                Create Link
              </LinkButton>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((link) => (
                <div
                  key={link.id}
                  className="glow-card flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="max-w-full truncate font-medium">
                        {link.title || link.shortUrl}
                      </p>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm text-primary">
                        {link.shortUrl}
                      </p>
                      <CopyButton value={link.shortUrl} size="sm" />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {link.original_url} ·{" "}
                      {formatDistanceToNow(new Date(link.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-semibold">{link.click_count}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>

                    <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/links/${link.id}`)}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(link.original_url, "_blank")}
                      >
                        <ExternalLink className="mr-2 size-4" />
                        Open destination
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setQrId(link.id)}>
                        <QrCode className="mr-2 size-4" />
                        QR Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(link.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The link will stop working
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!qrId} onOpenChange={() => setQrId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          {qrId && (
            <div className="flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/${qrId}`}
                alt="QR Code"
                className="rounded-xl border border-border"
                width={256}
                height={256}
              />
              <LinkButton href={`/api/qr/${qrId}`} variant="outline" download={`qr-${qrId}.png`}>
                Download PNG
              </LinkButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
