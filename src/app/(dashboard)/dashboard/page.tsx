import { redirect } from "next/navigation";
import { OperationalHealthBanner } from "@/components/dashboard/operational-health-banner";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";
import { getCurrentOrganizationSubscription } from "@/modules/subscriptions/data";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (!organization) {
    redirect("/setup-organization");
  }

  const subscription = await getCurrentOrganizationSubscription(user.id);

  return (
    <section className="ui-customer-stack">
      <div>
        <PageHeader title="Dashboard" />
        <p className="ui-text-muted" style={{ margin: "var(--space-2) 0 0" }}>
          Organization: {organization.name}
        </p>
        <p className="ui-text-muted" style={{ margin: "var(--space-1) 0 0" }}>
          Subscription: {subscription ? `${subscription.plan.name} (${subscription.status})` : "Not configured"}
        </p>
      </div>

      <OperationalHealthBanner failedSync={null} failedAnalysis={null} />

      <Card padded>
        <div className="rounded-lg border p-6 text-center text-muted-foreground">
          <p>Domain-specific dashboard content энд орно.</p>
          <p className="text-sm mt-1">src/components/dashboard/ дотор өөрийн component нэм.</p>
        </div>
      </Card>
    </section>
  );
}
