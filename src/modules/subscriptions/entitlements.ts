import { getCurrentUserOrganization } from "@/modules/organizations/data";
import { getActivePlan, getUsageCounters } from "@/modules/subscriptions/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type EntitlementFeature = "connect_resource" | "manual_sync" | "generate_report";

export type EntitlementResult = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
};

function currentPeriodKey(date = new Date()): string {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

function currentDayKey(date = new Date()): string {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

/**
 * Domain-specific resource count-г энд тохируулна уу.
 * Default: usage_counters дотор `pages_connected` metric ашиглана (DB schema-тай нийцнэ).
 */
async function getConnectedResourceCount(organizationId: string): Promise<number> {
  const admin = getSupabaseAdminClient();
  const { count } = await admin
    .from("usage_counters")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("metric_key", "pages_connected");
  return count ?? 0;
}

export async function checkOrganizationFeatureLimit(
  userId: string,
  feature: EntitlementFeature
): Promise<EntitlementResult> {
  const plan = await getActivePlan(userId);
  if (!plan) {
    return { allowed: false, limit: 0, used: 0, remaining: 0 };
  }

  if (feature === "connect_resource") {
    const organization = await getCurrentUserOrganization(userId);
    if (!organization) {
      return { allowed: false, limit: plan.max_pages, used: 0, remaining: plan.max_pages };
    }
    const used = await getConnectedResourceCount(organization.id);
    const limit = plan.max_pages;
    return { allowed: used < limit, limit, used, remaining: Math.max(limit - used, 0) };
  }

  if (feature === "manual_sync") {
    const counters = await getUsageCounters(userId, currentDayKey());
    const used = counters.find((c) => c.metric_key === "manual_syncs_used")?.value ?? 0;
    const limit = plan.syncs_per_day;
    return { allowed: used < limit, limit, used, remaining: Math.max(limit - used, 0) };
  }

  const counters = await getUsageCounters(userId, currentPeriodKey());
  const used = counters.find((c) => c.metric_key === "ai_reports_generated")?.value ?? 0;
  const limit = plan.monthly_ai_reports;
  return { allowed: used < limit, limit, used, remaining: Math.max(limit - used, 0) };
}
