import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getShortUrl } from "@/lib/slug";
import { generateQRCodeBuffer } from "@/lib/qrcode";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: link } = await supabase
    .from("links")
    .select("slug")
    .eq("id", id)
    .eq("user_id", user.id)
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
