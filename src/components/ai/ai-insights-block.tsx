import type {
  AnalysisJobStatusView,
  AnalysisReportHistoryView,
  AnalysisReportView,
  RecommendationRowView
} from "@/modules/ai/data";

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

type SignalLike = { title?: string; detail?: string; severity?: string };
type ExtraLike = { title?: string; detail?: string };

function formatTs(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AiInsightsBlock(props: {
  report: AnalysisReportView | null;
  recommendations: RecommendationRowView[];
  analysisJob: AnalysisJobStatusView | null;
  recentAnalysisJobs?: AnalysisJobStatusView[];
  reportHistory?: AnalysisReportHistoryView[];
}) {
  const { report, recommendations, analysisJob, recentAnalysisJobs = [], reportHistory = [] } = props;

  const findings = report?.findings_json;
  const findingsObj =
    findings && typeof findings === "object" && !Array.isArray(findings)
      ? (findings as Record<string, unknown>)
      : {};

  const signals = Array.isArray(findingsObj.deterministic_signals)
    ? (findingsObj.deterministic_signals as SignalLike[])
    : [];
  const extras = Array.isArray(findingsObj.llm_extra_findings)
    ? (findingsObj.llm_extra_findings as ExtraLike[])
    : [];

  const sortedRecs = [...recommendations].sort(
    (a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
  );

  const showFailure =
    !report && analysisJob?.status === "failed" && analysisJob.error_message;

  return (
    <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px dashed #cbd5e1" }}>
      <h4 style={{ margin: "0 0 0.35rem" }}>AI insights</h4>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
        Signals come from normalized metrics only (no raw provider payloads in the model path). Recommendations are
        stored in the <code>recommendations</code> table; the report row keeps pointers for audit.
      </p>

      {showFailure ? (
        <div
          style={{
            color: "#b91c1c",
            fontSize: "0.9rem",
            marginBottom: "0.5rem",
            padding: "0.5rem",
            background: "#fef2f2",
            borderRadius: 6
          }}
        >
          <strong>Last analysis failed</strong>
          <p style={{ margin: "0.35rem 0 0" }}>{analysisJob?.error_message}</p>
          <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem", fontSize: "0.8rem" }}>
            <li>Status: {analysisJob?.status}</li>
            <li>Scheduled: {formatTs(analysisJob?.scheduled_at)}</li>
            <li>Started: {formatTs(analysisJob?.started_at)}</li>
            <li>Finished: {formatTs(analysisJob?.finished_at)}</li>
            <li>
              Source sync job:{" "}
              {analysisJob?.source_sync_job_id ? (
                <code style={{ fontSize: "0.75rem" }}>{analysisJob.source_sync_job_id.slice(0, 8)}…</code>
              ) : (
                "— (manual / scheduled)"
              )}
            </li>
          </ul>
        </div>
      ) : null}

      {report ? (
        <>
          <p style={{ margin: "0.35rem 0", fontSize: "0.95rem" }}>
            <strong>Summary</strong>
          </p>
          <p style={{ margin: "0 0 0.5rem", whiteSpace: "pre-wrap" }}>{report.summary}</p>
          {report.model_name ? (
            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Model: {report.model_name}</p>
          ) : (
            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Deterministic narrative (no LLM)</p>
          )}

          <p style={{ margin: "0.5rem 0 0.25rem", fontSize: "0.9rem" }}>
            <strong>Key signals (rules)</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
            {signals.map((s, i) => (
              <li key={i}>
                <strong>{s.title ?? "Signal"}</strong> ({s.severity ?? "info"}): {s.detail ?? ""}
              </li>
            ))}
          </ul>

          {extras.length > 0 ? (
            <>
              <p style={{ margin: "0.5rem 0 0.25rem", fontSize: "0.9rem" }}>
                <strong>Additional notes (model)</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
                {extras.map((e, i) => (
                  <li key={i}>
                    <strong>{e.title}</strong>: {e.detail}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <p style={{ margin: "0.5rem 0 0.25rem", fontSize: "0.9rem" }}>
            <strong>Recommendations</strong> ({sortedRecs.length}) — from <code>recommendations</code> table
          </p>
          <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
            {sortedRecs.map((r) => (
              <li key={r.id} style={{ marginBottom: "0.35rem" }}>
                <span style={{ textTransform: "uppercase", fontSize: "0.7rem", color: "#64748b" }}>
                  {r.priority} · {r.category}
                </span>
                <br />
                <strong>{r.title}</strong> — {r.description}
              </li>
            ))}
          </ol>
        </>
      ) : !showFailure ? (
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          No ready report yet. Run a successful sync (or use regenerate) when monthly AI quota allows.
        </p>
      ) : null}

      {recentAnalysisJobs.length > 0 ? (
        <details style={{ marginTop: "0.65rem", fontSize: "0.8rem" }}>
          <summary style={{ cursor: "pointer", color: "#475569" }}>
            Recent analysis runs ({recentAnalysisJobs.length})
          </summary>
          <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}>
            {recentAnalysisJobs.map((j) => (
              <li key={j.id} style={{ marginBottom: "0.35rem" }}>
                <code>{j.id.slice(0, 8)}…</code> · <strong>{j.status}</strong>
                {j.error_message ? (
                  <span style={{ color: "#b91c1c", display: "block" }}>{j.error_message}</span>
                ) : null}
                <span style={{ color: "#64748b", display: "block" }}>
                  scheduled {formatTs(j.scheduled_at)} · finished {formatTs(j.finished_at)}
                </span>
                {j.source_sync_job_id ? (
                  <span style={{ color: "#64748b", display: "block" }}>
                    sync job <code>{j.source_sync_job_id.slice(0, 8)}…</code>
                  </span>
                ) : (
                  <span style={{ color: "#64748b", display: "block" }}>no sync linkage</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {reportHistory.length > 1 ? (
        <details style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          <summary style={{ cursor: "pointer", color: "#475569" }}>
            Report history (compare over time)
          </summary>
          <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}>
            {reportHistory.map((h) => (
              <li key={h.id} style={{ marginBottom: "0.35rem" }}>
                <span style={{ textTransform: "uppercase", fontSize: "0.65rem", color: "#64748b" }}>
                  {h.status}
                </span>{" "}
                · {formatTs(h.created_at)}
                <div style={{ color: "#334155", marginTop: "0.15rem" }}>
                  {h.summary.slice(0, 140)}
                  {h.summary.length > 140 ? "…" : ""}
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
