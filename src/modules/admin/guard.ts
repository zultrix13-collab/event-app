import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { isInternalOpsEmail } from "@/lib/internal-ops";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { maybeBootstrapSystemAdmin } from "@/modules/admin/bootstrap";
import { hasMinRole, type SystemAdminRole } from "@/modules/admin/roles";

export type SystemAdminActor = {
  adminId: string;
  userId: string;
  email: string;
  role: SystemAdminRole;
};

/**
 * DB-backed admin gate. Looks up the current user in system_admins.
 * On first access with an empty table, bootstraps from env allowlist.
 * Redirects non-admins to /dashboard.
 */
export async function requireSystemAdmin(
  minRole: SystemAdminRole = "viewer"
): Promise<SystemAdminActor> {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    redirect("/login");
  }

  const admin = getSupabaseAdminClient();
  const { data: row } = await admin
    .from("system_admins")
    .select("id,user_id,email,role,status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (row && row.status === "active") {
    const role = row.role as SystemAdminRole;
    if (!hasMinRole(role, minRole)) {
      redirect("/admin?error=insufficient_permissions");
    }
    return { adminId: row.id, userId: row.user_id, email: row.email, role };
  }

  if (!row) {
    const bootstrapped = await maybeBootstrapSystemAdmin(user.id, user.email);
    if (bootstrapped) {
      return {
        adminId: bootstrapped.id,
        userId: user.id,
        email: user.email.toLowerCase(),
        role: bootstrapped.role
      };
    }
  }

  redirect("/dashboard");
}

/** True if the user has an active row in `system_admins` (for nav / UI hints). */
export async function hasActiveSystemAdminRecord(userId: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("system_admins")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  return !error && data != null;
}

/**
 * For operator mutations (billing re-verify, job retries):
 * Legacy env allowlist OR active system_admins row with operator (or super_admin) role.
 * Viewers can browse /admin but cannot run these actions.
 */
export async function requireOperatorMutationActor(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    redirect("/login");
  }

  if (isInternalOpsEmail(user.email)) {
    return user.email.toLowerCase();
  }

  const admin = getSupabaseAdminClient();
  const { data: row } = await admin
    .from("system_admins")
    .select("email,role,status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (row && row.status === "active" && hasMinRole(row.role as SystemAdminRole, "operator")) {
    return row.email.toLowerCase();
  }

  redirect("/admin?error=insufficient_permissions");
}
