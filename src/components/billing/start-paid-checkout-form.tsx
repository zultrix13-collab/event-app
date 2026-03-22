"use client";

import { useActionState } from "react";
import { startPaidPlanCheckoutAction, type StartCheckoutState } from "@/modules/billing/actions";

type Props = {
  organizationId: string;
  planId: string;
  planLabel: string;
  disabled?: boolean;
};

const initial: StartCheckoutState = {};

export function StartPaidCheckoutForm({ organizationId, planId, planLabel, disabled = false }: Props) {
  const [state, formAction, pending] = useActionState(startPaidPlanCheckoutAction, initial);

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <form action={formAction} style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <input type="hidden" name="organizationId" value={organizationId} />
        <input type="hidden" name="planId" value={planId} />
        <button type="submit" disabled={pending || disabled}>
          {pending ? "Creating invoice…" : `Pay with QPay — ${planLabel}`}
        </button>
      </form>
      {state.error ? <span style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{state.error}</span> : null}
      {state.checkout ? (
        <div
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "0.75rem",
            fontSize: "0.9rem",
            background: "#f8fafc"
          }}
        >
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>Invoice {state.checkout.invoiceId.slice(0, 8)}…</strong> · {state.checkout.amount}{" "}
            {state.checkout.currency}
          </p>
          <p style={{ margin: "0 0 0.5rem", color: "#475569" }}>{state.checkout.callbackNote}</p>
          {state.checkout.paymentUrl ? (
            <p style={{ margin: "0 0 0.35rem" }}>
              <a href={state.checkout.paymentUrl} rel="noopener noreferrer" style={{ fontWeight: 600 }}>
                Open bank app link
              </a>
            </p>
          ) : null}
          {state.checkout.bankAppLinks.length > 0 ? (
            <details style={{ marginTop: "0.35rem" }}>
              <summary style={{ cursor: "pointer" }}>All bank deeplinks ({state.checkout.bankAppLinks.length})</summary>
              <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}>
                {state.checkout.bankAppLinks.map((l, i) => (
                  <li key={i}>
                    {l.link ? (
                      <a href={l.link} rel="noopener noreferrer">
                        {l.name ?? l.description ?? "Bank"}
                      </a>
                    ) : (
                      (l.name ?? l.description ?? "Bank")
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {state.checkout.qrImageDataUrl ? (
            <div style={{ marginTop: "0.5rem" }}>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.8rem" }}>Scan with your banking app</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.checkout.qrImageDataUrl} alt="QPay QR" width={200} height={200} style={{ maxWidth: "100%" }} />
            </div>
          ) : state.checkout.qrText ? (
            <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", wordBreak: "break-all", color: "#64748b" }}>
              QR payload: {state.checkout.qrText.slice(0, 120)}…
            </p>
          ) : null}
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
            Return to <a href="/billing">Billing</a> to watch invoice status. Activation happens only after QPay reports PAID
            and we re-fetch payment state.
          </p>
        </div>
      ) : null}
    </div>
  );
}
