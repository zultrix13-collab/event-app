import Link from "next/link";
import type { AnalysisJobStatusView } from "@/modules/ai/data";
import type { SyncJobSummary } from "@/modules/sync/data";

export function OperationalHealthBanner(props: {
  failedSync: SyncJobSummary | null;
  failedAnalysis: AnalysisJobStatusView | null;
}) {
  if (!props.failedSync && !props.failedAnalysis) {
    return null;
  }

  return (
    <aside
      style={{
        border: "1px solid #fecaca",
        background: "#fef2f2",
        borderRadius: 8,
        padding: "0.85rem 1rem",
        marginBottom: "1rem"
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: "#991b1b" }}>Operational alerts</h2>
      <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.9rem", color: "#7f1d1d" }}>
        {props.failedSync ? (
          <li style={{ marginBottom: "0.35rem" }}>
            <strong>Latest failed sync</strong> · job <code>{props.failedSync.id.slice(0, 8)}…</code> ·{" "}
            {props.failedSync.job_type}
            {props.failedSync.error_message ? (
              <span style={{ display: "block", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                {props.failedSync.error_message}
              </span>
            ) : null}
            <span style={{ display: "block", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Retry from <strong>Recent sync jobs</strong> below (same idempotent execute entrypoint).
            </span>
          </li>
        ) : null}
        {props.failedAnalysis ? (
          <li>
            <strong>Latest failed analysis</strong> · job <code>{props.failedAnalysis.id.slice(0, 8)}…</code>
            {props.failedAnalysis.error_message ? (
              <span style={{ display: "block", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                {props.failedAnalysis.error_message}
              </span>
            ) : null}
            <span style={{ display: "block", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Use <strong>Regenerate AI</strong> on a page card, or internal ops job retry.{" "}
              <Link href="/billing">Billing</Link> for payment issues.
            </span>
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
