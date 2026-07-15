export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (url.includes("your_supabase") || key.includes("your_supabase")) return false;
  if (key.startsWith("sb_publishable_") || key.startsWith("eyJ")) {
    return url.startsWith("http");
  }
  return url.startsWith("http");
}

export function isServiceRoleConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return false;
  if (key.includes("your_supabase") || key.includes("your_service_role")) return false;
  return url.startsWith("http");
}

export function getSupabaseEnv():
  | { url: string; anonKey: string }
  | null {
  if (!isSupabaseConfigured()) return null;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}

export function getServiceRoleEnv():
  | { url: string; serviceRoleKey: string }
  | null {
  if (!isServiceRoleConfigured()) return null;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  };
}
