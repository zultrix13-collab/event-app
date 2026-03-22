"use client";

import { useActionState } from "react";
import { regenerateAnalysisAction, type AiAnalysisActionState } from "@/modules/ai/actions";

type Props = {
  organizationId: string;
  internalPageId: string;
  disabled?: boolean;
};

const initial: AiAnalysisActionState = {};

export function RegenerateAnalysisForm({ organizationId, internalPageId, disabled = false }: Props) {
  const [state, formAction, pending] = useActionState(regenerateAnalysisAction, initial);

  return (
    <form action={formAction} style={{ display: "inline-grid", gap: "0.25rem" }}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="internalPageId" value={internalPageId} />
      <button type="submit" disabled={pending || disabled} style={{ fontSize: "0.85rem" }}>
        {pending ? "Regenerating…" : "Regenerate AI (no sync)"}
      </button>
      {state.error ? <span style={{ color: "#b91c1c", fontSize: "0.8rem" }}>{state.error}</span> : null}
      {state.message ? <span style={{ color: "#166534", fontSize: "0.8rem" }}>{state.message}</span> : null}
    </form>
  );
}
