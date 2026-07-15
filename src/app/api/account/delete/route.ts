import { NextResponse } from "next/server";
import { getSessionUser, clearDemoSession } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.isDemo) {
    await clearDemoSession();
    return NextResponse.json({ success: true });
  }

  try {
    const admin = await getDatabaseClient();
    await admin.from("profiles").delete().eq("id", session.id);

    const authAdmin = createAdminClient();
    const { error } = await authAdmin.auth.admin.deleteUser(session.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
