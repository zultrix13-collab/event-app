import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminPlansPlaceholderPage() {
  return (
    <div>
      <Link href="/admin" style={{ fontSize: "0.85rem", color: "#7c3aed" }}>
        ← Overview
      </Link>
      <h1 style={{ margin: "0.5rem 0 0.35rem", fontSize: "1.35rem", fontWeight: 700 }}>Plans</h1>
      <p style={{ color: "#64748b", maxWidth: "36rem" }}>
        Read-only plan directory for operators will land here (Phase E). Customer-facing pricing remains at{" "}
        <Link href="/pricing" style={{ color: "#7c3aed" }}>
          /pricing
        </Link>
        .
      </p>
    </div>
  );
}
