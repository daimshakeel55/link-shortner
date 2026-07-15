import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const env = getSupabaseEnv();
  const url = env?.url?.trim();
  const anonKey = env?.anonKey?.trim();

  if (!url || !anonKey) {
    return null;
  }

  try {
    const cookieStore = await cookies();

    return createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    });
  } catch (error) {
    console.error("createClient failed:", error);
    return null;
  }
}

export function getSupabaseClientDiagnostics() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  return {
    configured: isSupabaseConfigured(),
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    urlPrefix: url ? url.slice(0, 28) : null,
    anonKeyPrefix: anonKey ? anonKey.slice(0, 12) : null,
  };
}
