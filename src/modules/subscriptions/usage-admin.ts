/**
 * Server-only usage counter updates (service role; not exposed to clients).
 */
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function currentDayKey(date = new Date()): string {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

function currentMonthKey(date = new Date()): string {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

export async function incrementManualSyncUsage(organizationId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const periodKey = currentDayKey();

  const { data: row, error: readError } = await admin
    .from("usage_counters")
    .select("id,value")
    .eq("organization_id", organizationId)
    .eq("period_key", periodKey)
    .eq("metric_key", "manual_syncs_used")
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const next = (row?.value ?? 0) + 1;

  const { error: writeError } = await admin.from("usage_counters").upsert(
    {
      organization_id: organizationId,
      period_key: periodKey,
      metric_key: "manual_syncs_used",
      value: next
    },
    { onConflict: "organization_id,period_key,metric_key" }
  );

  if (writeError) {
    throw writeError;
  }
}

export async function incrementAiReportGeneratedForOrganization(organizationId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const periodKey = currentMonthKey();

  const { data: row, error: readError } = await admin
    .from("usage_counters")
    .select("id,value")
    .eq("organization_id", organizationId)
    .eq("period_key", periodKey)
    .eq("metric_key", "ai_reports_generated")
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const next = (row?.value ?? 0) + 1;

  const { error: writeError } = await admin.from("usage_counters").upsert(
    {
      organization_id: organizationId,
      period_key: periodKey,
      metric_key: "ai_reports_generated",
      value: next
    },
    { onConflict: "organization_id,period_key,metric_key" }
  );

  if (writeError) {
    throw writeError;
  }
}
