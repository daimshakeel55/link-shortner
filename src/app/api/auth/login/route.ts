import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseClientDiagnostics } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

type LoginStep =
  | "receive_request"
  | "validate_body"
  | "create_supabase_client"
  | "resolve_email"
  | "sign_in_with_password"
  | "create_session";

function logLoginFailure(
  step: LoginStep,
  error: string,
  details?: Record<string, unknown>
) {
  console.error(`[POST /api/auth/login] step=${step}`, error, details ?? {});
}

async function resolveEmail(identifier: string) {
  const trimmed = identifier.trim();

  if (trimmed.includes("@")) {
    return { email: trimmed, source: "identifier" as const };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      email: null,
      source: "username_lookup" as const,
      lookupError:
        "SUPABASE_SERVICE_ROLE_KEY is missing — cannot resolve username to email",
    };
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select("email")
    .eq("username", trimmed)
    .maybeSingle();

  if (error) {
    return {
      email: null,
      source: "username_lookup" as const,
      lookupError: error.message,
      lookupCode: error.code,
    };
  }

  return {
    email: profile?.email ?? null,
    source: "username_lookup" as const,
  };
}

export async function POST(request: Request) {
  const envDiagnostics = getSupabaseClientDiagnostics();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      logLoginFailure("receive_request", "Invalid JSON request body", {
        parseError: String(parseError),
      });
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      logLoginFailure("validate_body", message, {
        issues: parsed.error.issues,
      });
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      logLoginFailure(
        "create_supabase_client",
        "Supabase client could not be created",
        { env: envDiagnostics }
      );
      return NextResponse.json(
        { error: "Authentication service is not configured" },
        { status: 503 }
      );
    }

    const resolved = await resolveEmail(parsed.data.email);
    if (!resolved.email) {
      logLoginFailure(
        "resolve_email",
        resolved.lookupError ?? "No account found for that email or username",
        {
          identifier: parsed.data.email.trim(),
          source: resolved.source,
          lookupCode:
            "lookupCode" in resolved ? resolved.lookupCode : undefined,
        }
      );
      return NextResponse.json(
        {
          error:
            resolved.lookupError ??
            "No account found for that email or username",
        },
        { status: 401 }
      );
    }

    console.log(
      "[POST /api/auth/login] BEFORE signInWithPassword",
      JSON.stringify(
        {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
          email: resolved.email,
          supabaseClientCreated: supabase !== null,
        },
        null,
        2
      )
    );

    const result = await supabase.auth.signInWithPassword({
      email: resolved.email,
      password: parsed.data.password,
    });

    console.log(
      "[POST /api/auth/login] AFTER signInWithPassword complete result:",
      JSON.stringify(result, null, 2)
    );

    const { data, error } = result;

    if (error) {
      console.log("[POST /api/auth/login] result.error.code:", error.code);
      console.log("[POST /api/auth/login] result.error.message:", error.message);
      console.log("[POST /api/auth/login] result.error.status:", error.status);
      console.log("[POST /api/auth/login] result.error.name:", error.name);
      logLoginFailure("sign_in_with_password", error.message, {
        supabaseError: {
          message: error.message,
          name: error.name,
          status: error.status,
          code: error.code,
        },
        email: resolved.email,
        stack: error.stack,
      });

      if (
        error.message.toLowerCase().includes("fetch failed") ||
        error.message.includes("ENOTFOUND")
      ) {
        return NextResponse.json(
          {
            error:
              "Could not reach Supabase. Verify NEXT_PUBLIC_SUPABASE_URL on Vercel.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: 401 }
      );
    }

    if (!data.session) {
      logLoginFailure("create_session", "No session returned after sign-in", {
        userId: data.user?.id ?? null,
      });
      return NextResponse.json(
        { error: "Sign in succeeded but session was not created" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logLoginFailure(
      "sign_in_with_password",
      error instanceof Error ? error.message : String(error),
      {
        stack: error instanceof Error ? error.stack : undefined,
        env: envDiagnostics,
      }
    );

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sign in failed",
      },
      { status: 500 }
    );
  }
}
