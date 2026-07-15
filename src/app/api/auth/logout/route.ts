import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clearDemoSession } from "@/lib/auth/session";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearDemoSession();
  return NextResponse.json({ success: true });
}
