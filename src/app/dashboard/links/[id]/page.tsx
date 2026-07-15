import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { getDemoLinkById } from "@/lib/demo-store";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { LinkForm } from "@/components/links/link-form";

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login?redirect=/dashboard/links");

  const { id } = await params;

  if (session.isDemo) {
    const link = getDemoLinkById(session.id, id);
    if (!link) redirect("/dashboard/links");

    return (
      <>
        <DashboardHeader
          title="Edit Link"
          description="Update your short link"
          backHref="/dashboard/links"
        />
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-xl">
            <LinkForm link={link} mode="edit" />
          </div>
        </div>
      </>
    );
  }

  const supabase = await getDatabaseClient();
  const { data: link } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.id)
    .single();

  if (!link) redirect("/dashboard/links");

  return (
    <>
      <DashboardHeader
        title="Edit Link"
        description="Update your short link"
        backHref="/dashboard/links"
      />
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-xl">
          <LinkForm link={link} mode="edit" />
        </div>
      </div>
    </>
  );
}
