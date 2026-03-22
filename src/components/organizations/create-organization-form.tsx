"use client";

import { useActionState } from "react";
import {
  createOrganizationAction,
  type OrganizationActionState
} from "@/modules/organizations/actions";

const initialState: OrganizationActionState = {};

export function CreateOrganizationForm() {
  const [state, formAction, pending] = useActionState(createOrganizationAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "0.75rem", maxWidth: 420 }}>
      <label htmlFor="name">Organization name</label>
      <input id="name" name="name" type="text" required maxLength={120} />
      <button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create organization"}
      </button>
      {state.error ? <p style={{ color: "#b91c1c" }}>{state.error}</p> : null}
    </form>
  );
}
