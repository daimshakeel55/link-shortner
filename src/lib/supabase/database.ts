import { createServiceClient } from "@/lib/supabase/server";

export async function getDatabaseClient() {
  return createServiceClient();
}
