import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createClient,
  getSupabaseClientDiagnostics,
} from "@/lib/supabase/server";
import {
  DEMO_COOKIE,
  getDemoUserIdFromCookies,
  isDemoUserId,
} from "@/lib/demo-store";
import type { Database } from "@/types/database";

export interface SessionUser {
  id: string;
  isDemo: boolean;
  email?: string;
  fullName?: string;
  username?: string;
}

export interface SessionDiagnostics {
  step: string;
  ok: boolean;
  detail?: string;
}

type ProfileRow = {
  email: string;
  full_name: string | null;
  username?: string | null;
};

async function fetchProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, full_name, username")
    .eq("id", userId)
    .maybeSingle();

  if (!error) return data;

  console.error("Profile fetch failed:", error.message);

  const { data: fallback } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();

  return fallback;
}

export async function diagnoseSession(): Promise<SessionDiagnostics[]> {
  const steps: SessionDiagnostics[] = [];

  const env = getSupabaseClientDiagnostics();
  steps.push({
    step: "env.NEXT_PUBLIC_SUPABASE_URL",
    ok: env.hasUrl,
    detail: env.urlPrefix ?? "missing",
  });
  steps.push({
    step: "env.NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ok: env.hasAnonKey,
    detail: env.anonKeyPrefix ? `${env.anonKeyPrefix}...` : "missing",
  });
  steps.push({
    step: "isSupabaseConfigured()",
    ok: env.configured,
  });

  try {
    const supabase = await createClient();
    steps.push({
      step: "createClient()",
      ok: Boolean(supabase),
      detail: supabase ? "client created" : "returned null",
    });

    if (!supabase) return steps;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    steps.push({
      step: "supabase.auth.getUser()",
      ok: !authError,
      detail: authError?.message ?? (user ? `user ${user.id}` : "no user"),
    });

    if (user) {
      try {
        const profile = await fetchProfile(supabase, user.id);
        steps.push({
          step: "profiles.select",
          ok: true,
          detail: profile ? "profile found" : "no profile row",
        });
      } catch (profileError) {
        steps.push({
          step: "profiles.select",
          ok: false,
          detail: String(profileError),
        });
      }
    }

    return steps;
  } catch (error) {
    steps.push({
      step: "diagnoseSession",
      ok: false,
      detail: String(error),
    });
    return steps;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient();

    if (supabase) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth session lookup failed:", authError.message);
      }

      if (user) {
        const metadata = user.user_metadata ?? {};
        let profile: ProfileRow | null = null;

        try {
          profile = await fetchProfile(supabase, user.id);
        } catch (profileError) {
          console.error("Profile lookup failed:", profileError);
        }

        return {
          id: user.id,
          isDemo: false,
          email: profile?.email ?? user.email ?? undefined,
          fullName:
            profile?.full_name ??
            (typeof metadata.full_name === "string"
              ? metadata.full_name
              : undefined),
          username:
            profile?.username ??
            (typeof metadata.username === "string"
              ? metadata.username
              : undefined),
        };
      }
    }

    const demoId = await getDemoUserIdFromCookies();
    if (isDemoUserId(demoId)) {
      return { id: demoId, isDemo: true, fullName: "Demo User" };
    }

    return null;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Dynamic server usage")
    ) {
      throw error;
    }

    console.error("getSessionUser failed:", error);
    return null;
  }
}

export async function clearDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}
