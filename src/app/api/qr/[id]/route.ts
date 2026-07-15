import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { getShortUrl } from "@/lib/slug";
import { generateQRCodeBuffer } from "@/lib/qrcode";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let supabase;
  try {
    supabase = getDatabaseClient();
  } catch (error) {
    console.error("QR database error:", error);
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  const { data: link } = await supabase
    .from("links")
    .select("slug")
    .eq("id", id)
    .eq("user_id", session.id)
    .single();

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const shortUrl = getShortUrl(link.slug);
  const buffer = await generateQRCodeBuffer(shortUrl);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
