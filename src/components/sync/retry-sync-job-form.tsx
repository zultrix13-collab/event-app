"use client";

import { useActionState } from "react";
import { retrySyncJobAction, type SyncActionState } from "@/modules/sync/actions";

type RetrySyncJobFormProps = {
  jobId: string;
};

const initial: SyncActionState = {};

export function RetrySyncJobForm({ jobId }: RetrySyncJobFormProps) {
  const [state, formAction, pending] = useActionState(retrySyncJobAction, initial);

  return (
    <form action={formAction} style={{ display: "inline-grid", gap: "0.25rem" }}>
      <input type="hidden" name="jobId" value={jobId} />
      <button type="submit" disabled={pending}>
        {pending ? "Retrying…" : "Retry sync"}
      </button>
      {state.error ? <span style={{ color: "#b91c1c", fontSize: "0.8rem" }}>{state.error}</span> : null}
      {state.message ? <span style={{ color: "#166534", fontSize: "0.8rem" }}>{state.message}</span> : null}
    </form>
  );
}
