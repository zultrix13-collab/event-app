"use client";

import { useActionState } from "react";
import { selectPlanAction, type SelectPlanState } from "@/modules/subscriptions/actions";

type SelectPlanFormProps = {
  organizationId: string;
  planCode: string;
  isCurrentPlan: boolean;
  isSelectable: boolean;
};

const initialState: SelectPlanState = {};

export function SelectPlanForm({ organizationId, planCode, isCurrentPlan, isSelectable }: SelectPlanFormProps) {
  const [state, formAction, pending] = useActionState(selectPlanAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "0.5rem" }}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="planCode" value={planCode} />
      <button type="submit" disabled={pending || isCurrentPlan || !isSelectable}>
        {isCurrentPlan ? "Current plan" : !isSelectable ? "Unavailable until billing" : pending ? "Saving..." : "Select plan"}
      </button>
      {state.error ? <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p> : null}
    </form>
  );
}
