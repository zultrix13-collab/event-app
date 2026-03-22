import { requireSystemAdmin } from "@/modules/admin/guard";

export default async function AdminOverviewPage() {
  const actor = await requireSystemAdmin("viewer");

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Admin Control Plane
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        Platform operations dashboard. Signed in as{" "}
        <strong>{actor.email}</strong> ({actor.role.replace("_", " ")}).
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}
      >
        <SectionCard
          title="Organizations"
          description="View all orgs, subscriptions, connections"
          href="/admin/organizations"
        />
        <SectionCard
          title="Billing"
          description="Invoices, payments, reconciliation"
          href="/admin/billing"
        />
        <SectionCard
          title="Jobs"
          description="Sync and analysis job management"
          href="/admin/jobs"
        />
        <SectionCard
          title="Audit Log"
          description="Operator action history"
          href="/admin/audit"
        />
        <SectionCard
          title="Plans"
          description="View plan configuration"
          href="/admin/plans"
        />
        <SectionCard
          title="Admins"
          description="System admin user list"
          href="/admin/settings"
        />
      </div>

      <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
        Phase B will add live stats and recent audit events to this page.
      </p>
    </div>
  );
}

function SectionCard(props: { title: string; description: string; href: string }) {
  return (
    <a
      href={props.href}
      style={{
        display: "block",
        padding: "1.25rem",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "0.5rem",
        textDecoration: "none",
        color: "inherit"
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{props.title}</div>
      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{props.description}</div>
    </a>
  );
}
