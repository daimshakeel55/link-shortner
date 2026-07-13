import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return {
        id: user.id,
        isDemo: false,
        email: user.email,
        fullName: user.user_metadata?.full_name as string | undefined,
      };
    }
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
