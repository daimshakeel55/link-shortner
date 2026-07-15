import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations/auth";
import { getAuthCallbackUrl } from "@/lib/app-url";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Authentication service is not configured" },
      { status: 503 }
    );
  }

  const { email, password, username, fullName } = parsed.data;
  const admin = createAdminClient();

  if (admin) {
    const { data: existingUsername } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }
  }

  const authCallbackUrl = getAuthCallbackUrl();
  if (!authCallbackUrl) {
    return NextResponse.json(
      {
        error:
          "NEXT_PUBLIC_APP_URL is not configured on the server. Set it to https://link-shortner-hzgm.vercel.app",
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: authCallbackUrl,
      data: {
        username: username.trim(),
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Registration failed" },
      { status: 400 }
    );
  }

  if (data.session) {
    return NextResponse.json({ success: true, needsVerification: false });
  }

  return NextResponse.json({
    success: true,
    needsVerification: true,
    email: email.trim(),
  });
}
