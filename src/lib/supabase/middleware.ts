import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// Route protection rules:
// /admin/*       → requires super_admin role
// /specialist/*  → requires specialist or super_admin
// /app/*         → requires any authenticated user with is_approved=true
// /admin/*       → log X-Forwarded-For / X-Real-Ip (full IP whitelist in Sprint 6)
// ---------------------------------------------------------------------------

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/setup-organization",
  "/billing",
  "/settings",
  "/pages",
  "/admin",
  "/specialist",
  "/app",
];

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/verify",
  "/apply-vip",
  "/pending-approval",
  "/auth/callback",
];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some((prefix) => pathname.startsWith(prefix));
}

type ProfileRow = { role: string | null; is_approved: boolean | null };

export async function updateSession(request: NextRequest) {
  // Inject pathname for server components (active nav detection)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "auth_unavailable");
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Not authenticated → redirect to login
  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated → fetch profile for role-based checks
  if (user && isProtectedPath(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_approved")
      .eq("id", user.id)
      .single() as { data: ProfileRow | null };

    const role = profile?.role ?? "participant";
    const isApproved = profile?.is_approved ?? false;

    // Log IP for /admin (Sprint 6: full IP whitelist)
    if (pathname.startsWith("/admin")) {
      const ip =
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        "unknown";
      console.log(`[admin-access] user=${user.id} role=${role} ip=${ip} path=${pathname}`);
    }

    // /admin/* → super_admin only
    if (pathname.startsWith("/admin") && role !== "super_admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/app/home";
      return NextResponse.redirect(redirectUrl);
    }

    // /specialist/* → specialist or super_admin
    if (pathname.startsWith("/specialist") && role !== "specialist" && role !== "super_admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/app/home";
      return NextResponse.redirect(redirectUrl);
    }

    // /app/* → authenticated + is_approved
    if (pathname.startsWith("/app") && !isApproved) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/pending-approval";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Authenticated user hitting public auth pages → redirect to dashboard
  if (user && isPublicAuthPath(pathname) && pathname !== "/pending-approval") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
