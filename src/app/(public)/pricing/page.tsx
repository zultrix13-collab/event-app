import Link from "next/link";
import { SelectPlanForm } from "@/components/billing/select-plan-form";
import { StartPaidCheckoutForm } from "@/components/billing/start-paid-checkout-form";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";
import { getCurrentOrganizationSubscription, getPublicActivePlans } from "@/modules/subscriptions/data";

export default async function PricingPage() {
  const [plans, user] = await Promise.all([getPublicActivePlans(), getCurrentUser()]);
  const organization = user ? await getCurrentUserOrganization(user.id) : null;
  const subscription = user ? await getCurrentOrganizationSubscription(user.id) : null;

  return (
    <main style={{ padding: "2rem", display: "grid", gap: "1.5rem" }}>
      {user ? (
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          <Link href="/dashboard">← Dashboard</Link>
          {organization ? (
            <>
              {" · "}
              <Link href="/billing">Billing</Link>
            </>
          ) : null}
        </p>
      ) : null}
      <section>
        <h1>Pricing</h1>
        <p>
          Paid plans use <strong>QPay</strong>: we create an invoice, you pay via QR or bank deeplinks, then we verify with
          QPay before activating your subscription. No silent plan changes.
        </p>
      </section>

      {user && organization ? (
        <section style={{ border: "1px solid #e2e8f0", padding: "1rem", borderRadius: 8 }}>
          <h2>Current subscription</h2>
          {subscription ? (
            <p>
              {subscription.plan.name} ({subscription.plan.code}) — <strong>{subscription.status}</strong>
            </p>
          ) : (
            <p>No subscription found yet.</p>
          )}
          <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
            <Link href="/billing">Billing</Link> shows invoices and payment status.
          </p>
        </section>
      ) : (
        <section style={{ border: "1px solid #e2e8f0", padding: "1rem", borderRadius: 8 }}>
          <p>
            <Link href="/login">Sign in</Link> to start checkout for your organization.
          </p>
        </section>
      )}

      <section style={{ display: "grid", gap: "1rem" }}>
        {plans.map((plan) => {
          const paid = Number(plan.price_monthly) > 0;
          const isCurrentPlan = subscription?.plan_id === plan.id;
          const isActive = subscription?.status === "active";
          const isBootstrap = subscription?.status === "bootstrap_pending_billing";
          const blocked =
            subscription &&
            ["canceled", "expired", "suspended"].includes(subscription.status);

          const alreadyThisActivePlan = Boolean(subscription && isActive && isCurrentPlan);

          const canStarterCheckout =
            Boolean(organization && subscription && paid && plan.code === "starter" && isBootstrap);

          const canPaidPlanCheckout =
            Boolean(organization && subscription && paid && plan.code !== "starter" && !blocked) &&
            !alreadyThisActivePlan;

          const showCheckout = canStarterCheckout || canPaidPlanCheckout;

          return (
            <article
              key={plan.id}
              style={{ border: "1px solid #e2e8f0", padding: "1rem", borderRadius: 8, display: "grid", gap: "0.5rem" }}
            >
              <h3 style={{ margin: 0 }}>{plan.name}</h3>
              <p style={{ margin: 0 }}>
                {plan.price_monthly} {plan.currency} / month
              </p>
              <p style={{ margin: 0 }}>Max pages: {plan.max_pages}</p>
              <p style={{ margin: 0 }}>Syncs per day: {plan.syncs_per_day}</p>
              <p style={{ margin: 0 }}>Monthly AI reports: {plan.monthly_ai_reports}</p>

              {alreadyThisActivePlan ? (
                <p style={{ margin: 0, color: "#166534", fontSize: "0.9rem" }}>Current active plan</p>
              ) : null}

              {plan.code === "starter" && isBootstrap && paid ? (
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                  Your org is in <code>bootstrap_pending_billing</code>. Pay the starter invoice via QPay to move to{" "}
                  <code>active</code>.
                </p>
              ) : null}

              {!paid && organization ? (
                <SelectPlanForm
                  organizationId={organization.id}
                  planCode={plan.code}
                  isCurrentPlan={Boolean(isCurrentPlan && isActive)}
                  isSelectable
                />
              ) : null}

              {showCheckout && organization && subscription ? (
                <StartPaidCheckoutForm organizationId={organization.id} planId={plan.id} planLabel={plan.name} />
              ) : null}

              {paid && organization && subscription && !showCheckout && !alreadyThisActivePlan ? (
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                  {plan.code === "starter" && !isBootstrap
                    ? "Starter QPay checkout is only available in bootstrap_pending_billing."
                    : blocked
                      ? "Subscription is not in a payable state."
                      : "Checkout unavailable for this row."}
                </p>
              ) : null}

              {!organization && paid ? (
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Sign in to pay for this plan.</p>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
