import { redirect } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";

export default async function ResourcesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (!organization) {
    redirect("/setup-organization");
  }

  return (
    <section className="ui-customer-stack">
      <PageHeader
        title="Resources"
        description="Domain-specific resources for your organization."
      />

      <Card padded>
        <div className="rounded-lg border p-6 text-center text-muted-foreground">
          <p>Domain-specific resource list энд орно.</p>
          <p className="text-sm mt-1">
            src/components/ дотор өөрийн resource management component-уудыг нэм.
          </p>
        </div>
      </Card>
    </section>
  );
}
