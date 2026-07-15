import { redirect } from "next/navigation";
import { diagnoseSession, getSessionUser } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { GlowBackground } from "@/components/shared/glow-background";

export const dynamic = "force-dynamic";

function DebugPanel({ error }: { error: unknown }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-xl font-semibold text-destructive">
        Dashboard server error
      </h1>
      <pre className="overflow-auto rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs whitespace-pre-wrap">
        {String(error)}
      </pre>
    </div>
  );
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const diagnostics = await diagnoseSession();
    const failedStep = diagnostics.find((step) => !step.ok);

    if (failedStep && failedStep.step.startsWith("env.")) {
      console.error("Dashboard env diagnostics:", diagnostics);
      return (
        <div className="min-h-screen bg-background p-6">
          <DebugPanel
            error={`Missing Supabase env at runtime.

Failed step: ${failedStep.step}
Detail: ${failedStep.detail ?? "unknown"}

Full trace:
${diagnostics.map((d) => `${d.ok ? "OK" : "FAIL"} ${d.step} ${d.detail ?? ""}`).join("\n")}`}
          />
        </div>
      );
    }

    const session = await getSessionUser();

    if (!session) {
      redirect("/login?redirect=/dashboard");
    }

    return (
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <GlowBackground>
          <main className="min-h-screen flex-1 overflow-x-hidden overflow-y-auto pt-14 md:pt-0">
            {children}
          </main>
        </GlowBackground>
      </div>
    );
  } catch (error) {
    console.error("Dashboard layout failed:", error);

    if (isNextRedirect(error)) {
      throw error;
    }

    return (
      <div className="min-h-screen bg-background p-6">
        <DebugPanel error={error} />
      </div>
    );
  }
}
