import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { profileSchema } from "@/lib/validations/settings";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.isDemo) {
    return NextResponse.json({
      fullName: session.fullName ?? "Demo User",
      email: "demo@linkly.app",
      avatarUrl: null,
    });
  }

  let admin;
  try {
    admin = getDatabaseClient();
  } catch (error) {
    console.error("Profile database error:", error);
    return NextResponse.json(
      {
        fullName: session.fullName ?? "",
        email: session.email ?? "",
        avatarUrl: null,
      }
    );
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", session.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    fullName: profile.full_name ?? session.fullName ?? "",
    email: profile.email ?? session.email ?? "",
    avatarUrl: profile.avatar_url,
  });
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session || session.isDemo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  let admin;
  try {
    admin = getDatabaseClient();
  } catch (error) {
    console.error("Profile update database error:", error);
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  const { error } = await admin
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", session.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
