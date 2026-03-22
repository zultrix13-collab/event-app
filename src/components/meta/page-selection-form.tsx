"use client";

import { useActionState } from "react";
import { setMetaPageSelectionAction, type MetaPageSelectionState } from "@/modules/meta/actions";

type MetaPageSelectionFormProps = {
  organizationId: string;
  metaPageId: string;
  isSelected: boolean;
  disabled?: boolean;
};

const initialState: MetaPageSelectionState = {};

export function MetaPageSelectionForm({
  organizationId,
  metaPageId,
  isSelected,
  disabled = false
}: MetaPageSelectionFormProps) {
  const [state, formAction, pending] = useActionState(setMetaPageSelectionAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "0.35rem" }}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="metaPageId" value={metaPageId} />
      <input type="hidden" name="selected" value={isSelected ? "false" : "true"} />
      <button type="submit" disabled={pending || disabled}>
        {isSelected ? "Deselect" : "Select"}
      </button>
      {state.error ? <p style={{ margin: 0, color: "#b91c1c" }}>{state.error}</p> : null}
    </form>
  );
}
