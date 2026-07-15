import { getSessionUser } from "@/lib/auth/session";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default async function DashboardPage() {
  const session = await getSessionUser();

  return (
    <DashboardHome userName={session?.fullName ?? session?.email} />
  );
}
