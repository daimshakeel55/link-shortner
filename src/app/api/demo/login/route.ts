import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createDemoUserId,
  DEMO_COOKIE,
} from "@/lib/demo-store";

export async function POST() {
  const userId = createDemoUserId();
  const cookieStore = await cookies();

  cookieStore.set(DEMO_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true, userId });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
  return NextResponse.json({ success: true });
}
