"use client";

import { useActionState } from "react";
import { manualSyncPageAction, type SyncActionState } from "@/modules/sync/actions";

type ManualSyncFormProps = {
  organizationId: string;
  internalPageId: string;
  pageLabel: string;
  disabled?: boolean;
};

const initial: SyncActionState = {};

export function ManualSyncForm({
  organizationId,
  internalPageId,
  pageLabel,
  disabled = false
}: ManualSyncFormProps) {
  const [state, formAction, pending] = useActionState(manualSyncPageAction, initial);

  return (
    <form action={formAction} style={{ display: "inline-grid", gap: "0.35rem" }}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="internalPageId" value={internalPageId} />
      <button type="submit" disabled={pending || disabled}>
        {pending ? "Syncing…" : `Manual sync (${pageLabel})`}
      </button>
      {state.error ? <span style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{state.error}</span> : null}
      {state.message ? <span style={{ color: "#166534", fontSize: "0.85rem" }}>{state.message}</span> : null}
    </form>
  );
}
