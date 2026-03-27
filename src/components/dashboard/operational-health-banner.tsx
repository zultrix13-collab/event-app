import { Alert } from "@/components/ui";

export type JobFailureSummary = {
  id: string;
  job_type?: string;
  error_message: string | null;
};

export function OperationalHealthBanner(props: {
  failedSync: JobFailureSummary | null;
  failedAnalysis: JobFailureSummary | null;
}) {
  if (!props.failedSync && !props.failedAnalysis) {
    return null;
  }

  return (
    <Alert variant="danger" className="ui-operational-alert">
      <p style={{ margin: "0 0 var(--space-2)", fontWeight: 600 }}>Operational alerts</p>
      <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "var(--text-sm)" }}>
        {props.failedSync ? (
          <li style={{ marginBottom: "0.35rem" }}>
            <strong>Latest failed job</strong> · <code>{props.failedSync.id.slice(0, 8)}…</code>
            {props.failedSync.job_type ? ` · ${props.failedSync.job_type}` : null}
            {props.failedSync.error_message ? (
              <span className="ui-text-error" style={{ display: "block", marginTop: "0.2rem" }}>
                {props.failedSync.error_message}
              </span>
            ) : null}
          </li>
        ) : null}
        {props.failedAnalysis ? (
          <li>
            <strong>Latest failed analysis</strong> · <code>{props.failedAnalysis.id.slice(0, 8)}…</code>
            {props.failedAnalysis.error_message ? (
              <span className="ui-text-error" style={{ display: "block", marginTop: "0.2rem" }}>
                {props.failedAnalysis.error_message}
              </span>
            ) : null}
          </li>
        ) : null}
      </ul>
    </Alert>
  );
}
