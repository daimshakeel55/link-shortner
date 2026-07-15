import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getDatabaseClient } from "@/lib/supabase/database";
import {
  DEMO_COOKIE,
  getDemoUserIdFromCookies,
  isDemoUserId,
} from "@/lib/demo-store";

export interface SessionUser {
  id: string;
  isDemo: boolean;
  email?: string;
  fullName?: string;
  username?: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = await getDatabaseClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name, username")
      .eq("id", user.id)
      .maybeSingle();

    const metadata = user.user_metadata ?? {};

    return {
      id: user.id,
      isDemo: false,
      email: profile?.email ?? user.email ?? undefined,
      fullName:
        profile?.full_name ??
        (typeof metadata.full_name === "string" ? metadata.full_name : undefined),
      username:
        profile?.username ??
        (typeof metadata.username === "string" ? metadata.username : undefined),
    };
  }

  const demoId = await getDemoUserIdFromCookies();
  if (isDemoUserId(demoId)) {
    return { id: demoId, isDemo: true, fullName: "Demo User" };
  }

  return null;
}

export async function clearDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}
