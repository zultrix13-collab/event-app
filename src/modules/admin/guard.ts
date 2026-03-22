import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { isInternalOpsEmail } from "@/lib/internal-ops";

/** Returns actor email or redirects to dashboard. */
export async function requireInternalOpsActor(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.email || !isInternalOpsEmail(user.email)) {
    redirect("/dashboard");
  }
  return user.email;
}
