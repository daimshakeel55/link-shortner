import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseClient } from "@/lib/supabase/database";
import { getDemoLinkById } from "@/lib/demo-store";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { LinkForm } from "@/components/links/link-form";
import type { Link } from "@/types/database";

async function loadLink(sessionId: string, linkId: string): Promise<Link | null> {
  try {
    const supabase = getDatabaseClient();
    const { data: link, error } = await supabase
      .from("links")
      .select("*")
      .eq("id", linkId)
      .eq("user_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("Edit link fetch failed:", error.message);
      return null;
    }

    return link;
  } catch (error) {
    console.error("Edit link page failed:", error);
    return null;
  }
}

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

  const link = await loadLink(session.id, id);
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
