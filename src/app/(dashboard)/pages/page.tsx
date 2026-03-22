import Link from "next/link";
import { redirect } from "next/navigation";
import { MetaPageSelectionForm } from "@/components/meta/page-selection-form";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";
import {
  countSelectedActivePagesFromRows,
  getOrganizationMetaConnection,
  getOrganizationMetaPages
} from "@/modules/meta/data";
import { getActivePlan } from "@/modules/subscriptions/data";

type PagesPageProps = {
  searchParams: Promise<{ meta?: string; reason?: string }>;
};

export default async function PagesPage({ searchParams }: PagesPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (!organization) {
    redirect("/setup-organization");
  }

  const [plan, connection, pages] = await Promise.all([
    getActivePlan(user.id),
    getOrganizationMetaConnection(organization.id),
    getOrganizationMetaPages(organization.id)
  ]);

  const maxPages = plan?.max_pages ?? 0;
  const selectedCount = countSelectedActivePagesFromRows(pages);
  const limitReached = selectedCount >= maxPages && maxPages > 0;

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <h1>Connected Pages</h1>
      <p>Meta OAuth authorizes external data access. Platform authentication remains handled by Supabase Auth.</p>
      <p style={{ color: "#475569", fontSize: "0.9rem" }}>
        Selected page limits use rows in <code>meta_pages</code> only — not <code>usage_counters</code>.
      </p>

      {!connection ? (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem" }}>
          <p>No Meta connection found for this organization.</p>
          <a href="/api/meta/connect">Connect Meta Account</a>
        </div>
      ) : (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem", display: "grid", gap: "0.5rem" }}>
          <p>Connection status: {connection.status}</p>
          <p>Selected pages: {selectedCount} / {maxPages}</p>
          <a href="/api/meta/connect">Reconnect and refresh pages</a>
        </div>
      )}

      {params.meta === "success" ? <p style={{ color: "#166534" }}>Meta account connected successfully.</p> : null}
      {params.meta === "error" ? (
        <p style={{ color: "#b91c1c" }}>Meta connection failed: {params.reason ?? "unknown_error"}</p>
      ) : null}

      {limitReached ? (
        <p style={{ color: "#92400e" }}>
          Page limit reached for your current plan. Deselect a page or <Link href="/pricing">upgrade plan</Link>{" "}
          (upgrade action will be enabled after billing integration).
        </p>
      ) : null}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {pages.length === 0 ? <p>No pages discovered yet. Connect Meta to fetch available pages.</p> : null}
        {pages.map((page) => {
          const disableSelect = !page.is_selected && limitReached;
          return (
            <article
              key={page.id}
              style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.75rem", display: "grid", gap: "0.5rem" }}
            >
              <strong>{page.name}</strong>
              <p style={{ margin: 0 }}>Category: {page.category ?? "n/a"}</p>
              <p style={{ margin: 0 }}>Status: {page.status}</p>
              <MetaPageSelectionForm
                organizationId={organization.id}
                metaPageId={page.id}
                isSelected={page.is_selected}
                disabled={disableSelect}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
