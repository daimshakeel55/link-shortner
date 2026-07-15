import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getAuthCallbackUrl } from "@/lib/app-url";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = resendSchema.safeParse(body);
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

  const authCallbackUrl = getAuthCallbackUrl();
  if (!authCallbackUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL is not configured on the server" },
      { status: 503 }
    );
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email.trim(),
    options: {
      emailRedirectTo: authCallbackUrl,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Could not resend verification email" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
