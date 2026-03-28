import Link from "next/link";
import { redirect } from "next/navigation";
import { OperationalHealthBanner } from "@/components/dashboard/operational-health-banner";
import { PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/modules/auth/session";
import { getCurrentUserOrganization } from "@/modules/organizations/data";
import { getCurrentOrganizationSubscription } from "@/modules/subscriptions/data";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentUserOrganization(user.id);
  if (!organization) {
    redirect("/setup-organization");
  }

  const subscription = await getCurrentOrganizationSubscription(user.id);
  const supabase = await createClient();

  // Fetch stats
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalSessions },
    { count: totalRegistrations },
    { count: todaySessions },
    { count: activeMembers },
  ] = await Promise.all([
    supabase
      .from("event_sessions")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("seat_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed"),
    supabase
      .from("event_sessions")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("starts_at", today + "T00:00:00Z")
      .lte("starts_at", today + "T23:59:59Z"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
  ]);

  // Recent registrations
  const { data: recentActivity } = await supabase
    .from("seat_registrations")
    .select("id, status, created_at, event_sessions(title)")
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(5);

  const statCards = [
    {
      label: "Нийт хөтөлбөр",
      value: totalSessions ?? 0,
      icon: "📅",
      hint: "Нийтлэгдсэн",
    },
    {
      label: "Нийт бүртгэл",
      value: totalRegistrations ?? 0,
      icon: "✅",
      hint: "Баталгаажсан",
    },
    {
      label: "Өнөөдрийн арга хэмжаа",
      value: todaySessions ?? 0,
      icon: "🕐",
      hint: new Date().toLocaleDateString("mn-MN"),
    },
    {
      label: "Идэвхтэй хэрэглэгч",
      value: activeMembers ?? 0,
      icon: "👤",
      hint: "Бүртгэлтэй",
    },
  ];

  return (
    <section className="ui-customer-stack" style={{ animation: "fadeIn 0.2s ease both" }}>
      {/* Header */}
      <div>
        <PageHeader
          title={organization.name}
          description="Байгууллагын удирдлагын самбар"
        />
        {subscription && (
          <div style={{ marginTop: "var(--space-3)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span className="ui-badge ui-badge--green">{subscription.plan.name}</span>
            <span className="ui-text-muted">{subscription.status}</span>
          </div>
        )}
      </div>

      <OperationalHealthBanner failedSync={null} failedAnalysis={null} />

      {/* Stat cards */}
      <div className="ui-stat-grid">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="ui-stat-card ui-stat-card--accent"
            style={{ animationDelay: `${i * 0.05}s`, animation: "fadeIn 0.2s ease both" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
              <span className="ui-stat-card__label">{card.label}</span>
              <span style={{ fontSize: "1.25rem" }}>{card.icon}</span>
            </div>
            <strong className="ui-stat-card__value">{card.value.toLocaleString()}</strong>
            <span className="ui-stat-card__hint">{card.hint}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="ui-card ui-card--padded">
        <h2 className="ui-section-title" style={{ marginBottom: "var(--space-4)" }}>
          Хурдан үйлдлүүд
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <Link href="/dashboard/pages" className="ui-button ui-button--primary">
            📅 Хөтөлбөр нэмэх
          </Link>
          <Link href="/admin/notifications" className="ui-button ui-button--secondary">
            🔔 Мэдэгдэл явуулах
          </Link>
          <Link href="/admin/stats" className="ui-button ui-button--secondary">
            📊 Тайлан харах
          </Link>
          <Link href="/billing" className="ui-button ui-button--ghost">
            💳 Subscription
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="ui-card ui-card--padded">
        <div className="ui-section-head" style={{ marginBottom: "var(--space-4)" }}>
          <h2 className="ui-section-title">Сүүлийн бүртгэлүүд</h2>
          <Link href="/admin/stats" className="ui-link-subtle">
            Бүгдийг харах →
          </Link>
        </div>

        {!recentActivity || recentActivity.length === 0 ? (
          <div className="ui-empty-state" style={{ padding: "var(--space-6)" }}>
            <div className="ui-empty-state__icon">📋</div>
            <p className="ui-empty-state__title">Одоогоор бүртгэл алга</p>
            <p className="ui-empty-state__desc">Оролцогчид бүртгэгдэх үед энд харагдана.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {recentActivity.map((reg) => {
              const sessions = reg.event_sessions;
              const sessionTitle = sessions && !Array.isArray(sessions)
                ? sessions.title
                : null;
              return (
                <div
                  key={reg.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg-muted)",
                    gap: "var(--space-3)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sessionTitle ?? "Нэргүй арга хэмжаа"}
                    </p>
                    <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      {new Date(reg.created_at).toLocaleString("mn-MN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="ui-badge ui-badge--green">✓ Бүртгэгдсэн</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
