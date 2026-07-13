import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { GlowBackground } from "@/components/shared/glow-background";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <GlowBackground>
        <main className="min-h-screen flex-1 overflow-auto">{children}</main>
      </GlowBackground>
    </div>
  );
}
