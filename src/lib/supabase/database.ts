import { createAdminClient } from "@/lib/supabase/admin";

export function getDatabaseClient() {
  const client = createAdminClient();
  if (!client) {
    throw new Error(
      "Supabase service role is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your environment."
    );
  }
  return client;
}

export function getDatabaseClientSafe() {
  try {
    return getDatabaseClient();
  } catch {
    return null;
  }
}
