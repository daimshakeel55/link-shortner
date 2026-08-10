"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LinkWithShortUrl, PaginatedResult } from "@/types";

interface LinksQueryParams {
  page?: number;
  search?: string;
  status?: string;
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: "same-origin",
  });

  if (res.status === 401) {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    throw new Error("Please sign in again");
  }

  return res;
}

async function fetchLinks(
  params: LinksQueryParams
): Promise<PaginatedResult<LinkWithShortUrl>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);

  const res = await apiFetch(`/api/links?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch links");
  return res.json();
}

async function createLink(data: Record<string, unknown>): Promise<LinkWithShortUrl> {
  const res = await apiFetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create link");
  return json;
}

async function updateLink(
  id: string,
  data: Record<string, unknown>
): Promise<LinkWithShortUrl> {
  const res = await apiFetch(`/api/links/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to update link");
  return json;
}

async function deleteLink(id: string): Promise<void> {
  const res = await apiFetch(`/api/links/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Failed to delete link");
  }
}

export function useLinks(params: LinksQueryParams = {}, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["links", params],
    queryFn: () => fetchLinks(params),
    staleTime: 0,
    refetchInterval: options?.refetchInterval,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await apiFetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json() as Promise<{
        totalLinks: number;
        totalViews: number;
        uniqueVisitors: number;
      }>;
    },
    staleTime: 0,
    refetchInterval: 10_000,
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useAnalytics(period: string, linkId?: string) {
  return useQuery({
    queryKey: ["analytics", period, linkId],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (linkId) params.set("linkId", linkId);
      const res = await apiFetch(`/api/analytics?${params}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}
