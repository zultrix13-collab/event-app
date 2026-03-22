"use client";

import { useActionState } from "react";
import { loginWithOtpAction, type AuthActionState } from "@/modules/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginWithOtpAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "0.75rem", maxWidth: 360 }}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" />
      <button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send login link"}
      </button>
      {state.error ? <p style={{ color: "#b91c1c" }}>{state.error}</p> : null}
      {state.message ? <p style={{ color: "#166534" }}>{state.message}</p> : null}
    </form>
  );
}
