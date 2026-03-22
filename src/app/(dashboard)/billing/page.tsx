import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";
import {
  getRecentBillingEventsForCurrentUserOrg,
  getRecentInvoicesForCurrentUserOrg,
  getRecentPaymentTransactionsForCurrentUserOrg
} from "@/modules/billing/data";
import { getCurrentOrganizationSubscription } from "@/modules/subscriptions/data";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (!organization) {
    redirect("/setup-organization");
  }

  const [subscription, invoices, txns, events] = await Promise.all([
    getCurrentOrganizationSubscription(user.id),
    getRecentInvoicesForCurrentUserOrg(user.id, 15),
    getRecentPaymentTransactionsForCurrentUserOrg(user.id, 20),
    getRecentBillingEventsForCurrentUserOrg(user.id, 12)
  ]);

  return (
    <section style={{ display: "grid", gap: "1.25rem" }}>
      <h1>Billing</h1>
      <p style={{ color: "#64748b", margin: 0 }}>
        Invoices and payments are organization-scoped. Activation always follows a successful QPay{" "}
        <code>payment/check</code> call — webhooks alone are not trusted.
      </p>

      {subscription ? (
        <section style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Subscription</h2>
          <p style={{ margin: 0 }}>
            Plan: <strong>{subscription.plan.name}</strong> ({subscription.plan.code})
          </p>
          <p style={{ margin: "0.35rem 0 0" }}>
            Status: <strong>{subscription.status}</strong>
          </p>
          {subscription.status === "bootstrap_pending_billing" ? (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#92400e" }}>
              Complete QPay checkout on <Link href="/pricing">Pricing</Link> to activate billing.
            </p>
          ) : null}
        </section>
      ) : (
        <p>No subscription row found.</p>
      )}

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Recent invoices</h2>
        {invoices.length === 0 ? (
          <p style={{ margin: 0 }}>No invoices yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.9rem" }}>
            {invoices.map((inv) => (
              <li key={inv.id} style={{ marginBottom: "0.5rem" }}>
                <code>{inv.id.slice(0, 8)}…</code> · <strong>{inv.status}</strong> · {inv.amount} {inv.currency}
                {inv.paid_at ? <span style={{ color: "#64748b" }}> · paid {inv.paid_at}</span> : null}
                {inv.due_at ? <span style={{ color: "#64748b" }}> · due {inv.due_at}</span> : null}
                {typeof inv.verification_attempt_count === "number" && inv.verification_attempt_count > 0 ? (
                  <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem" }}>
                    Verifications: {inv.verification_attempt_count}
                    {inv.last_verification_outcome ? ` · last: ${inv.last_verification_outcome}` : null}
                    {inv.last_verification_at ? ` @ ${inv.last_verification_at}` : null}
                  </span>
                ) : null}
                {inv.provider_last_error ? (
                  <span style={{ color: "#b91c1c", display: "block", fontSize: "0.85rem" }}>
                    {inv.provider_last_error}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Payment transactions</h2>
        {txns.length === 0 ? (
          <p style={{ margin: 0 }}>No payment rows yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.9rem" }}>
            {txns.map((t) => (
              <li key={t.id} style={{ marginBottom: "0.4rem" }}>
                <strong>{t.status}</strong> · {t.amount} {t.currency}
                {t.provider_txn_id ? (
                  <span style={{ color: "#64748b" }}>
                    {" "}
                    · txn <code>{String(t.provider_txn_id).slice(0, 12)}…</code>
                  </span>
                ) : null}
                {t.last_verification_error ? (
                  <span style={{ color: "#b91c1c", display: "block" }}>{t.last_verification_error}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Billing events (your org)</h2>
        {events.length === 0 ? (
          <p style={{ margin: 0 }}>No events yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
            {events.map((ev) => (
              <li key={ev.id} style={{ marginBottom: "0.35rem" }}>
                <strong>{ev.event_type}</strong>
                {ev.processing_error ? (
                  <span style={{ color: "#b91c1c" }}> — {ev.processing_error}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p style={{ fontSize: "0.9rem" }}>
        <Link href="/pricing">← Back to pricing</Link>
      </p>
    </section>
  );
}
