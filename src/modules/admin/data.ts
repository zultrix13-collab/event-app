/**
 * Admin / internal ops reads (service role).
 * Call only from routes gated by `requireSystemAdmin` (`/admin/*`).
 * See `docs/admin-auth-v1.md` — `/admin` is DB/bootstrap; internal ops also allows env allowlist without a row.
 */
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BillingEventRow, PaymentTransactionRow } from "@/modules/billing/data";
import type { InvoiceWithOrg } from "@/modules/billing/admin-data";
import type { Database } from "@/types/database";

export type PlanDirectoryRow = Database["public"]["Tables"]["plans"]["Row"];

export type SystemAdminDirectoryRow = Database["public"]["Tables"]["system_admins"]["Row"];

export type OrganizationOpsRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  subscriptions: {
    status: string;
    plan_id: string;
    plans: { code: string; name: string } | null;
  }[];
  /** Legacy field — integration_connections table does not exist in DB. Always []. */
  integration_connections: {
    status: string;
    last_error: string | null;
    last_validated_at: string | null;
  }[];
};

/** Enriched row for `/admin/organizations` (computed in `getOrganizationsForAdminList`). */
export type OrganizationAdminListRow = OrganizationOpsRow & {
  ownerEmail: string | null;
  /** Primary subscription status (orgs have one subscription row). */
  subscriptionStatus: string | null;
  planLabel: string | null;
  selectedPagesCount: number;
  metaConnectionSummary: string;
  hasFailedSync24h: boolean;
  hasFailedAnalysis24h: boolean;
};

export type SyncJobOpsRow = {
  id: string;
  organization_id: string;
  meta_page_id: string;
  job_type: string;
  status: string;
  attempt_count: number;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
  organizations: { name: string; slug: string } | null;
  /** Legacy field — integration_resources table does not exist in DB. Always null. */
  integration_resources: { name: string } | null;
};

export type AnalysisJobOpsRow = {
  id: string;
  organization_id: string;
  meta_page_id: string;
  status: string;
  attempt_count: number;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
  source_sync_job_id: string | null;
  organizations: { name: string; slug: string } | null;
  /** Legacy field — integration_resources table does not exist in DB. Always null. */
  integration_resources: { name: string } | null;
};

export type OperatorAuditEventRow = {
  id: string;
  actor_email: string;
  action_type: string;
  organization_id: string | null;
  resource_type: string;
  resource_id: string;
  metadata: unknown;
  created_at: string;
};

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export async function getOrganizationsForOps(limit = 80): Promise<OrganizationOpsRow[]> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select(
      `
      id, name, slug, status, created_at,
      subscriptions ( status, plan_id, plans (code, name) )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as (Omit<OrganizationOpsRow, "subscriptions" | "integration_connections"> & {
    subscriptions: OrganizationOpsRow["subscriptions"] | OrganizationOpsRow["subscriptions"][0] | null;
  })[];

  return rows.map((row) => ({
    ...row,
    subscriptions: asArray(row.subscriptions),
    integration_connections: [] // integration_connections table does not exist in DB
  }));
}

async function getOrgIdsWithFailedJobsSince(_params: {
  sinceIso: string;
  table: "analysis_jobs";
}): Promise<Set<string>> {
  // analysis_jobs table removed — return empty set
  return new Set<string>();
}

/**
 * Organizations list for system admin: owner email, page counts, 24h job failure flags.
 * Reuses the same nested shape as `getOrganizationsForOps` plus members, pages.
 */
export async function getOrganizationsForAdminList(limit = 500): Promise<OrganizationAdminListRow[]> {
  const admin = getSupabaseAdminClient();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [raw, failedSyncOrgs, failedAnalysisOrgs] = await Promise.all([
    admin
      .from("organizations")
      .select(
        `
        id, name, slug, status, created_at,
        subscriptions ( status, plan_id, plans (code, name) ),
        organization_members ( role, status, profiles ( email ) )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    Promise.resolve(new Set<string>()), // meta_sync_jobs removed (table no longer exists)
    getOrgIdsWithFailedJobsSince({ sinceIso: dayAgo, table: "analysis_jobs" })
  ]);

  if (raw.error) {
    throw raw.error;
  }

  const rows = (raw.data ?? []) as unknown as (Omit<OrganizationOpsRow, "subscriptions" | "integration_connections"> & {
    subscriptions: OrganizationOpsRow["subscriptions"] | OrganizationOpsRow["subscriptions"][0] | null;
    organization_members:
      | { role: string; status: string; profiles: { email: string } | null }[]
      | { role: string; status: string; profiles: { email: string } | null }
      | null;
  })[];

  return rows.map((row) => {
    const subscriptions = asArray(row.subscriptions);
    // integration_connections table does not exist in DB — always empty
    const integration_connections: OrganizationOpsRow["integration_connections"] = [];
    const members = asArray(row.organization_members);
    // integration_resources table does not exist in DB — selected pages always 0
    const selectedPagesCount = 0;

    const owner = members.find((m) => m.role === "owner" && m.status === "active");
    const ownerEmail = owner?.profiles?.email?.trim() ?? null;

    const sub = subscriptions[0];
    const subscriptionStatus = sub?.status ?? null;
    const planLabel = sub?.plans ? `${sub.plans.name} (${sub.plans.code})` : null;

    const metaConnectionSummary = "No connection"; // integration_connections not in DB

    const base: OrganizationOpsRow = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      created_at: row.created_at,
      subscriptions,
      integration_connections
    };

    return {
      ...base,
      ownerEmail,
      subscriptionStatus,
      planLabel,
      selectedPagesCount,
      metaConnectionSummary,
      hasFailedSync24h: failedSyncOrgs.has(row.id),
      hasFailedAnalysis24h: failedAnalysisOrgs.has(row.id)
    };
  });
}

export type OrganizationAdminDetail = {
  organization: OrganizationOpsRow & {
    updated_at: string;
    organization_members: Array<{
      role: string;
      status: string;
      profiles: { id: string; email: string; full_name: string | null } | null;
    }>;
    /** Legacy field — integration_resources table does not exist in DB. Always []. */
    integration_resources: Array<{
      id: string;
      resource_external_id: string;
      name: string;
      is_active: boolean;
      status: string;
      last_synced_at: string | null;
      category: string | null;
    }>;
  };
  subscriptionWithPlan:
    | (OrganizationOpsRow["subscriptions"][0] & {
        plans: { code: string; name: string; max_pages: number; syncs_per_day: number; monthly_ai_reports: number } | null;
        current_period_start: string;
        current_period_end: string | null;
      })
    | null;
  /** Legacy field — integration_connections table does not exist in DB. Always []. */
  integrationConnections: OrganizationOpsRow["integration_connections"];
  usageCounters: Array<{
    id: string;
    period_key: string;
    metric_key: string;
    value: number;
    updated_at: string;
  }>;
  recentSyncJobs: SyncJobOpsRow[];
  recentAnalysisJobs: AnalysisJobOpsRow[];
  recentInvoices: InvoiceWithOrg[];
  recentPaymentTransactions: PaymentTransactionRow[];
  recentBillingEvents: BillingEventRow[];
  recentAuditEvents: OperatorAuditEventRow[];
};

export async function getOrganizationAdminDetail(organizationId: string): Promise<OrganizationAdminDetail | null> {
  const admin = getSupabaseAdminClient();

  const { data: orgRow, error: orgErr } = await admin
    .from("organizations")
    .select(
      `
      id, name, slug, status, created_at, updated_at,
      subscriptions (
        status, plan_id, current_period_start, current_period_end, cancel_at_period_end, trial_ends_at,
        plans ( code, name, max_pages, syncs_per_day, monthly_ai_reports, report_retention_days )
      ),
      organization_members ( role, status, profiles ( id, email, full_name ) )
    `
    )
    .eq("id", organizationId)
    .maybeSingle();

  if (orgErr || !orgRow) {
    return null;
  }

  const o = orgRow as unknown as {
    id: string;
    name: string;
    slug: string;
    status: string;
    created_at: string;
    updated_at: string;
    subscriptions: OrganizationOpsRow["subscriptions"] | OrganizationOpsRow["subscriptions"][0] | null;
    organization_members:
      | { role: string; status: string; profiles: { id: string; email: string; full_name: string | null } | null }[]
      | { role: string; status: string; profiles: { id: string; email: string; full_name: string | null } | null }
      | null;
  };

  const subscriptions = asArray(o.subscriptions);
  // integration_connections table does not exist in DB — always empty
  const integration_connections: OrganizationOpsRow["integration_connections"] = [];
  const organization_members = asArray(o.organization_members);
  // integration_resources table does not exist in DB — always empty
  const integration_resources: OrganizationAdminDetail["organization"]["integration_resources"] = [];

  const subFirst = subscriptions[0] as
    | (OrganizationOpsRow["subscriptions"][0] & {
        current_period_start?: string;
        current_period_end?: string | null;
        cancel_at_period_end?: boolean;
        trial_ends_at?: string | null;
        plans?: { code: string; name: string; max_pages: number; syncs_per_day: number; monthly_ai_reports: number; report_retention_days: number } | null;
      })
    | undefined;

  const subscriptionWithPlan =
    subFirst && subFirst.plans
      ? {
          status: subFirst.status,
          plan_id: subFirst.plan_id,
          plans: subFirst.plans,
          current_period_start: subFirst.current_period_start ?? "",
          current_period_end: subFirst.current_period_end ?? null
        }
      : subFirst
        ? {
            status: subFirst.status,
            plan_id: subFirst.plan_id,
            plans: subFirst.plans ?? null,
            current_period_start: subFirst.current_period_start ?? "",
            current_period_end: subFirst.current_period_end ?? null
          }
        : null;

  const organization: OrganizationAdminDetail["organization"] = {
    id: o.id,
    name: o.name,
    slug: o.slug,
    status: o.status,
    created_at: o.created_at,
    updated_at: o.updated_at,
    subscriptions,
    integration_connections,
    organization_members,
    integration_resources
  };

  const [
    usageRes,
    syncRes,
    analysisRes,
    invRes,
    payRes,
    billRes,
    auditRes
  ] = await Promise.all([
    admin.from("usage_counters").select("*").eq("organization_id", organizationId).order("updated_at", { ascending: false }).limit(48),
    // meta_sync_jobs table removed — return empty result
    Promise.resolve({ data: [], error: null }),
    // analysis_jobs table removed — return empty result
    Promise.resolve({ data: [], error: null }),
    admin.from("invoices").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(15),
    admin.from("payment_transactions").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(12),
    admin.from("billing_events").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(25),
    admin.from("operator_audit_events").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(30)
  ]);

  if (
    usageRes.error ||
    syncRes.error ||
    analysisRes.error ||
    invRes.error ||
    payRes.error ||
    billRes.error ||
    auditRes.error
  ) {
    throw (
      usageRes.error ||
      syncRes.error ||
      analysisRes.error ||
      invRes.error ||
      payRes.error ||
      billRes.error ||
      auditRes.error
    );
  }

  return {
    organization,
    subscriptionWithPlan,
    integrationConnections: integration_connections,
    usageCounters: (usageRes.data ?? []) as OrganizationAdminDetail["usageCounters"],
    recentSyncJobs: (syncRes.data ?? []) as SyncJobOpsRow[],
    recentAnalysisJobs: (analysisRes.data ?? []) as AnalysisJobOpsRow[],
    recentInvoices: (invRes.data ?? []) as InvoiceWithOrg[],
    recentPaymentTransactions: (payRes.data ?? []) as PaymentTransactionRow[],
    recentBillingEvents: (billRes.data ?? []) as BillingEventRow[],
    recentAuditEvents: (auditRes.data ?? []) as OperatorAuditEventRow[]
  };
}

export async function getRecentSyncJobsForOps(_limit = 50): Promise<SyncJobOpsRow[]> {
  // meta_sync_jobs table removed — return empty list
  return [];
}

export async function getRecentAnalysisJobsForOps(_limit = 50): Promise<AnalysisJobOpsRow[]> {
  // analysis_jobs table removed — return empty list
  return [];
}

export async function getGlobalRecentInvoicesForOps(limit = 30): Promise<InvoiceWithOrg[]> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("invoices")
    .select("*, organizations(name, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as InvoiceWithOrg[];
}

export async function getGlobalRecentPaymentTransactionsForOps(limit = 40): Promise<PaymentTransactionRow[]> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("payment_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as PaymentTransactionRow[];
}

export async function getGlobalRecentBillingEventsForOps(limit = 60): Promise<BillingEventRow[]> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("billing_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as BillingEventRow[];
}

const AUDIT_MAX_LIMIT = 200;

export type OperatorAuditListParams = {
  limit?: number;
  /** Case-insensitive substring match on `action_type`. */
  actionContains?: string | null;
  /** Case-insensitive substring match on `actor_email`. */
  actorContains?: string | null;
  /** Exact `organization_id` (UUID). */
  organizationId?: string | null;
};

export async function listOperatorAuditEvents(params: OperatorAuditListParams = {}): Promise<OperatorAuditEventRow[]> {
  const rawLimit = params.limit ?? 100;
  const limit = Math.min(Math.max(rawLimit, 1), AUDIT_MAX_LIMIT);
  const admin = getSupabaseAdminClient();

  let q = admin.from("operator_audit_events").select("*");

  const actionTrim = params.actionContains?.trim();
  if (actionTrim) {
    q = q.ilike("action_type", `%${actionTrim}%`);
  }
  const actorTrim = params.actorContains?.trim();
  if (actorTrim) {
    q = q.ilike("actor_email", `%${actorTrim}%`);
  }
  const orgTrim = params.organizationId?.trim();
  if (orgTrim) {
    q = q.eq("organization_id", orgTrim);
  }

  const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as OperatorAuditEventRow[];
}

export async function getRecentOperatorAuditEvents(limit = 40): Promise<OperatorAuditEventRow[]> {
  return listOperatorAuditEvents({ limit });
}

/** Distinct action types from recent rows (for filter hints). */
export async function getRecentOperatorAuditActionTypes(sampleSize = 800): Promise<string[]> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("operator_audit_events")
    .select("action_type")
    .order("created_at", { ascending: false })
    .limit(sampleSize);

  if (error) {
    throw error;
  }

  const set = new Set((data ?? []).map((r) => r.action_type as string));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function getPlansForAdminDirectory(): Promise<PlanDirectoryRow[]> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("plans").select("*").order("price_monthly", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as PlanDirectoryRow[];
}

export async function getSubscriptionCountsByPlanId(): Promise<Record<string, number>> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("subscriptions").select("plan_id");

  if (error) {
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as { plan_id: string }).plan_id;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export async function getSystemAdminsDirectory(): Promise<SystemAdminDirectoryRow[]> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("system_admins")
    .select("id,user_id,email,role,status,granted_by,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as SystemAdminDirectoryRow[];
}

export type OpsOverviewCounts = {
  organizationCount: number;
  /** Subscriptions in a billing-active lifecycle (paid or trial). */
  activeSubscriptionCount: number;
  pendingInvoiceCount: number;
  /** Pending invoices whose `due_at` is in the past (stale payment / abandoned checkout). */
  pendingPastDueCount: number;
  /** Pending invoices created more than 3 days ago (reconciliation / webhook follow-up). */
  pendingOlderThan3dCount: number;
  failedSyncRecentCount: number;
  failedAnalysisRecentCount: number;
};

export async function getOpsOverviewCounts(): Promise<OpsOverviewCounts> {
  const admin = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const [
    orgs,
    activeSubs,
    pendingHead,
    pastDue,
    oldPending,
    failedSync24h,
    failedAnalysis24h
  ] = await Promise.all([
    admin.from("organizations").select("id", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing"]),
    admin.from("invoices").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("invoices").select("*", { count: "exact", head: true }).eq("status", "pending").lt("due_at", nowIso),
    admin.from("invoices").select("*", { count: "exact", head: true }).eq("status", "pending").lt("created_at", threeDaysAgo),
    // meta_sync_jobs table removed — always return 0
    Promise.resolve({ count: 0, error: null }),
    // analysis_jobs table removed — always return 0
    Promise.resolve({ count: 0, error: null })
  ]);

  return {
    organizationCount: orgs.count ?? 0,
    activeSubscriptionCount: activeSubs.count ?? 0,
    pendingInvoiceCount: pendingHead.count ?? 0,
    pendingPastDueCount: pastDue.count ?? 0,
    pendingOlderThan3dCount: oldPending.count ?? 0,
    failedSyncRecentCount: failedSync24h.count ?? 0,
    failedAnalysisRecentCount: failedAnalysis24h.count ?? 0
  };
}
