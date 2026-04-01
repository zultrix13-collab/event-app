import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { signOutAction } from "@/modules/auth/actions";
import { getCurrentUser } from "@/modules/auth/session";
import { hasActiveSystemAdminRecord } from "@/modules/admin/guard";
import { isInternalOpsEmail } from "@/lib/internal-ops";

type DashboardLayoutProps = {
  children: ReactNode;
};

const APP_NAV_LINKS = [
  { href: "/app/home", label: "Нүүр", icon: "🏠" },
  { href: "/app/programme", label: "Хөтөлбөр", icon: "📅" },
  { href: "/app/map", label: "Газрын зураг", icon: "🗺️" },
  { href: "/app/services", label: "Үйлчилгээ", icon: "🛍️" },
] as const;

const DASHBOARD_NAV_LINKS = [
  { href: "/dashboard", label: "Самбар" },
  { href: "/billing", label: "Billing" },
] as const;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const showSystemAdminNav =
    Boolean(user.id) &&
    (isInternalOpsEmail(user.email) || (await hasActiveSystemAdminRecord(user.id)));

  // Determine current pathname for active state
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  // Detect if this is an /app/* route (attendee shell) vs /dashboard/* (org shell)
  const isAppRoute = pathname.startsWith("/app");

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <nav className="app-shell__nav" aria-label="Үндсэн навигаци">
          <span className="app-shell__brand">Арга хэмжаа</span>

          {isAppRoute ? (
            // App attendee nav links
            <>
              {APP_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </>
          ) : (
            // Dashboard org nav links
            <>
              {DASHBOARD_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {showSystemAdminNav ? (
            <Link href="/admin" className="app-shell__nav-link--accent">
              System admin
            </Link>
          ) : null}
        </nav>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Гарах
          </Button>
        </form>
      </header>

      <main className="app-shell__main">{children}</main>

      {/* Mobile bottom navigation — only for /app/* routes */}
      {isAppRoute && (
        <nav className="ui-bottom-nav" aria-label="Доод навигаци">
          <div className="ui-bottom-nav__inner">
            {APP_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`ui-bottom-nav__item ${isActive(link.href) ? "ui-bottom-nav__item--active" : ""}`}
              >
                <span className="ui-bottom-nav__icon" aria-hidden="true">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
            <Link
              href="/app/help"
              aria-current={isActive("/app/help") ? "page" : undefined}
              className={`ui-bottom-nav__item ${isActive("/app/help") ? "ui-bottom-nav__item--active" : ""}`}
            >
              <span className="ui-bottom-nav__icon" aria-hidden="true">👤</span>
              <span>Профайл</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
