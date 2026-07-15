import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linkPasswordSchema } from "@/lib/validations/link";
import { verifyPassword } from "@/lib/slug";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { success } = rateLimit(`verify-password:${ip}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = linkPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { slug, password } = body as { slug: string; password: string };

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }

  const { data: link } = await supabase
    .from("links")
    .select("password_hash")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!link?.password_hash) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const valid = await verifyPassword(password, link.password_hash);

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
