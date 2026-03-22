import { redirect } from "next/navigation";
import { CreateOrganizationForm } from "@/components/organizations/create-organization-form";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";

export default async function SetupOrganizationPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (organization) {
    redirect("/dashboard");
  }

  return (
    <section>
      <h1>Create organization</h1>
      <p>Set up your organization to start using the dashboard.</p>
      <CreateOrganizationForm />
    </section>
  );
}
