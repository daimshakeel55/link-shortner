import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getServiceRoleEnv } from "@/lib/supabase/config";

export function createAdminClient() {
  const env = getServiceRoleEnv();
  if (!env) return null;

  return createClient<Database>(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
