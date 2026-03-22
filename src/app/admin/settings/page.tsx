import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminAdminsPlaceholderPage() {
  return (
    <div>
      <Link href="/admin" style={{ fontSize: "0.85rem", color: "#7c3aed" }}>
        ← Overview
      </Link>
      <h1 style={{ margin: "0.5rem 0 0.35rem", fontSize: "1.35rem", fontWeight: 700 }}>System admins</h1>
      <p style={{ color: "#64748b", maxWidth: "36rem" }}>
        Read-only list of <code>system_admins</code> rows will appear here (Phase E). Bootstrap and role changes
        are documented in <code>docs/admin-bootstrap.md</code>.
      </p>
    </div>
  );
}
