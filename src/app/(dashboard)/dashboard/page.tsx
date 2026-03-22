import Link from "next/link";
import { redirect } from "next/navigation";
import { AiInsightsBlock } from "@/components/ai/ai-insights-block";
import { RegenerateAnalysisForm } from "@/components/ai/regenerate-analysis-form";
import { OperationalHealthBanner } from "@/components/dashboard/operational-health-banner";
import { ManualSyncForm } from "@/components/sync/manual-sync-form";
import { RetrySyncJobForm } from "@/components/sync/retry-sync-job-form";
import {
  getLatestAnalysisJobForPage,
  getLatestFailedAnalysisJobForOrganization,
  getLatestReadyReportForPage,
  getRecentAnalysisJobsForPage,
  getRecommendationsForReport,
  getReportHistoryForPage
} from "@/modules/ai/data";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";
import { getOrganizationMetaPages } from "@/modules/meta/data";
import { getCurrentOrganizationSubscription } from "@/modules/subscriptions/data";
import { checkOrganizationFeatureLimit } from "@/modules/subscriptions/entitlements";
import {
  getLatestDailyMetricForPage,
  getLatestFailedSyncJobForOrganization,
  getLatestSyncJobForPage,
  getRecentSyncJobsForOrganization
} from "@/modules/sync/data";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (!organization) {
    redirect("/setup-organization");
  }

  const [subscription, pages, recentJobs, manualEntitlement, aiEntitlement, failedSync, failedAnalysis] =
    await Promise.all([
      getCurrentOrganizationSubscription(user.id),
      getOrganizationMetaPages(organization.id),
      getRecentSyncJobsForOrganization(organization.id, 8),
      checkOrganizationFeatureLimit(user.id, "manual_sync"),
      checkOrganizationFeatureLimit(user.id, "generate_ai_report"),
      getLatestFailedSyncJobForOrganization(organization.id),
      getLatestFailedAnalysisJobForOrganization(organization.id)
    ]);

  const selectedPages = pages.filter((p) => p.is_selected && p.status === "active");

  const pageCards = await Promise.all(
    selectedPages.map(async (p) => {
      const [metric, job, aiReport, aiJob, aiJobRuns, reportHistory] = await Promise.all([
        getLatestDailyMetricForPage(p.id),
        getLatestSyncJobForPage(p.id),
        getLatestReadyReportForPage(p.id),
        getLatestAnalysisJobForPage(p.id),
        getRecentAnalysisJobsForPage(p.id, 6),
        getReportHistoryForPage(p.id, 10)
      ]);
      const recs = aiReport ? await getRecommendationsForReport(aiReport.id) : [];
      return { page: p, metric, job, aiReport, aiJob, aiJobRuns, reportHistory, recs };
    })
  );

  return (
    <section style={{ display: "grid", gap: "1.25rem" }}>
      <h1>Dashboard</h1>
      <OperationalHealthBanner failedSync={failedSync} failedAnalysis={failedAnalysis} />
      <p>Organization: {organization.name}</p>
      <p>
        Subscription: {subscription ? `${subscription.plan.name} (${subscription.status})` : "Not configured"}
      </p>
      <p>
        Meta pages: <Link href="/pages">/pages</Link>
      </p>
      {!aiEntitlement.allowed ? (
        <p style={{ fontSize: "0.9rem", color: "#92400e" }}>
          AI report quota: {aiEntitlement.used}/{aiEntitlement.limit} this month — generation is skipped until quota
          resets or plan allows more.
        </p>
      ) : null}

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Sync, metrics & AI</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 0 }}>
          Metrics come from Meta Graph sync. AI uses normalized tables + rule-based signals; optional OpenAI refines
          narrative. Billing uses QPay; see <Link href="/billing">/billing</Link> for invoices and payment status.
        </p>

        <h3>Selected pages</h3>
        {pageCards.length === 0 ? (
          <p>No pages selected. Connect Meta and select pages on /pages.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
            {pageCards.map(({ page, metric, job, aiReport, aiJob, aiJobRuns, reportHistory, recs }) => (
              <li
                key={page.id}
                style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "0.75rem" }}
              >
                <strong>{page.name}</strong>
                <p style={{ margin: "0.35rem 0", fontSize: "0.9rem" }}>
                  Last synced (page): {page.last_synced_at ?? "—"}
                </p>
                <p style={{ margin: "0.35rem 0", fontSize: "0.9rem" }}>
                  Latest sync job: {job ? `${job.status} (${job.job_type})` : "—"}
                  {job?.finished_at ? ` · finished ${job.finished_at}` : null}
                  {job?.error_message ? (
                    <span style={{ color: "#b91c1c", display: "block" }}>{job.error_message}</span>
                  ) : null}
                </p>
                <p style={{ margin: "0.35rem 0", fontSize: "0.9rem" }}>
                  Latest daily row:{" "}
                  {metric
                    ? `${metric.metric_date} · fans ${metric.followers_count ?? "—"} · impressions ${metric.impressions ?? "—"} · engaged ${metric.engaged_users ?? "—"}`
                    : "—"}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <ManualSyncForm
                    organizationId={organization.id}
                    internalPageId={page.id}
                    pageLabel={page.name}
                    disabled={!manualEntitlement.allowed}
                  />
                  <RegenerateAnalysisForm
                    organizationId={organization.id}
                    internalPageId={page.id}
                    disabled={!aiEntitlement.allowed}
                  />
                  {!manualEntitlement.allowed ? (
                    <span style={{ fontSize: "0.8rem", color: "#92400e" }}>
                      Manual sync quota: {manualEntitlement.used}/{manualEntitlement.limit} today
                    </span>
                  ) : null}
                </div>

                <AiInsightsBlock
                  report={aiReport}
                  recommendations={recs}
                  analysisJob={aiJob}
                  recentAnalysisJobs={aiJobRuns}
                  reportHistory={reportHistory}
                />
              </li>
            ))}
          </ul>
        )}

        <h3>Recent sync jobs</h3>
        {recentJobs.length === 0 ? (
          <p>No jobs yet.</p>
        ) : (
          <ul style={{ paddingLeft: "1.1rem" }}>
            {recentJobs.map((j) => (
              <li key={j.id} style={{ marginBottom: "0.5rem" }}>
                <code style={{ fontSize: "0.8rem" }}>{j.id.slice(0, 8)}…</code> · {j.job_type} ·{" "}
                <strong>{j.status}</strong>
                {j.error_message ? (
                  <span style={{ color: "#b91c1c", display: "block", fontSize: "0.85rem" }}>
                    {j.error_message}
                  </span>
                ) : null}
                {j.status === "failed" || j.status === "queued" ? (
                  <div style={{ marginTop: "0.25rem" }}>
                    <RetrySyncJobForm jobId={j.id} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
        Phase 5–6: sync runs inline after selection or manual trigger; analysis runs after successful sync when quota
        allows. Queue/worker can call the same execute entrypoints later.
      </p>
    </section>
  );
}
