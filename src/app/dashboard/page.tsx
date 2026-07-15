import { getSessionUser } from "@/lib/auth/session";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default async function DashboardPage() {
  try {
    const session = await getSessionUser();

    return (
      <DashboardHome userName={session?.fullName ?? session?.email} />
    );
  } catch (error) {
    console.error("Dashboard page failed:", error);

    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-destructive">
          Dashboard page error
        </h1>
        <pre className="mt-4 overflow-auto rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs whitespace-pre-wrap">
          {String(error)}
        </pre>
      </div>
    );
  }
}
