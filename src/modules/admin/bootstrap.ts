/**
 * One-time bootstrap: if system_admins table is empty and the current user's
 * email is in the MARTECH_INTERNAL_OPS_EMAILS env allowlist, seed them as
 * super_admin. After the first admin exists, the env var is ignored for
 * access control (DB is the source of truth).
 */
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isInternalOpsEmail } from "@/lib/internal-ops";

export async function maybeBootstrapSystemAdmin(
  userId: string,
  email: string
): Promise<{ id: string; role: "super_admin" } | null> {
  if (!isInternalOpsEmail(email)) return null;

  const admin = getSupabaseAdminClient();

  const { count, error: countErr } = await admin
    .from("system_admins")
    .select("*", { count: "exact", head: true });

  if (countErr || (count ?? 0) > 0) return null;

  const { data, error } = await admin
    .from("system_admins")
    .insert({
      user_id: userId,
      email: email.toLowerCase(),
      role: "super_admin" as const,
      status: "active" as const,
      granted_by: "system_bootstrap"
    })
    .select("id,role")
    .single();

  if (error) {
    console.warn("[admin/bootstrap] Bootstrap insert failed (race or duplicate):", error.message);
    return null;
  }

  console.info("[admin/bootstrap] Bootstrapped first system admin:", email);
  return data as { id: string; role: "super_admin" };
}
