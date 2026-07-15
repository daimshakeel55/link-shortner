import { NextResponse } from "next/server";
import { diagnoseSession } from "@/lib/auth/session";
import { getSupabaseClientDiagnostics } from "@/lib/supabase/server";

export async function GET() {
  try {
    const env = getSupabaseClientDiagnostics();
    const steps = await diagnoseSession();

    return NextResponse.json({
      env,
      steps,
      failedStep: steps.find((step) => !step.ok) ?? null,
    });
  } catch (error) {
    console.error("/api/debug/dashboard failed:", error);
    return NextResponse.json(
      {
        error: String(error),
      },
      { status: 500 }
    );
  }
}
