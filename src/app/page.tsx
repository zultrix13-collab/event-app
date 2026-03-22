import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (!organization) {
    redirect("/setup-organization");
  }

  redirect("/dashboard");
}
