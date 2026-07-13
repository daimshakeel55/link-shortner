import { DashboardHeader } from "@/components/dashboard/sidebar";
import { LinkForm } from "@/components/links/link-form";

export default function NewLinkPage() {
  return (
    <>
      <DashboardHeader title="Create Link" description="Paste a URL. That's it." />
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-xl">
          <LinkForm mode="create" />
        </div>
      </div>
    </>
  );
}
