import Link from "next/link";
import { getRecentOperatorAuditEvents } from "@/modules/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const audit = await getRecentOperatorAuditEvents(100);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <Link href="/admin" style={{ fontSize: "0.85rem", color: "#7c3aed" }}>
          ← Overview
        </Link>
        <h1 style={{ margin: "0.5rem 0 0.35rem", fontSize: "1.35rem", fontWeight: 700 }}>Audit log</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
          Last 100 entries from <code>operator_audit_events</code> (read-only).
        </p>
      </div>

      {audit.length === 0 ? (
        <p style={{ color: "#64748b" }}>No operator actions recorded yet.</p>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "0.55rem 0.75rem", fontWeight: 600, color: "#475569" }}>Time (UTC)</th>
                <th style={{ padding: "0.55rem 0.75rem", fontWeight: 600, color: "#475569" }}>Action</th>
                <th style={{ padding: "0.55rem 0.75rem", fontWeight: 600, color: "#475569" }}>Actor</th>
                <th style={{ padding: "0.55rem 0.75rem", fontWeight: 600, color: "#475569" }}>Resource</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.45rem 0.75rem", whiteSpace: "nowrap", color: "#64748b" }}>
                    {new Date(row.created_at).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td style={{ padding: "0.45rem 0.75rem" }}>
                    <code style={{ fontSize: "0.75rem" }}>{row.action_type}</code>
                  </td>
                  <td style={{ padding: "0.45rem 0.75rem" }}>{row.actor_email}</td>
                  <td style={{ padding: "0.45rem 0.75rem", color: "#64748b" }}>
                    {row.resource_type}{" "}
                    <code style={{ fontSize: "0.72rem" }}>{row.resource_id}</code>
                    {row.organization_id ? (
                      <span>
                        {" "}
                        · org <code style={{ fontSize: "0.72rem" }}>{row.organization_id}</code>
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
