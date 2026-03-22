"use client";

import { useActionState } from "react";
import { operatorRetryAnalysisJobAction, type OperatorActionState } from "@/modules/admin/actions";

const initial: OperatorActionState = {};

export function OperatorRetryAnalysisForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(operatorRetryAnalysisJobAction, initial);

  return (
    <form action={formAction} style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
      <input type="hidden" name="jobId" value={jobId} />
      <button type="submit" disabled={pending} style={{ fontSize: "0.75rem" }}>
        {pending ? "Running…" : "Ops: retry analysis"}
      </button>
      {state.error ? <span style={{ color: "#b91c1c", fontSize: "0.7rem" }}>{state.error}</span> : null}
      {state.message ? <span style={{ color: "#166534", fontSize: "0.7rem" }}>{state.message}</span> : null}
    </form>
  );
}
