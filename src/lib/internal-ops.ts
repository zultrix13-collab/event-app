/**
 * Lightweight internal ops gate (env allowlist). Not a full RBAC product.
 */
export function isInternalOpsEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const raw = process.env.MARTECH_INTERNAL_OPS_EMAILS ?? "";
  const allowed = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  if (allowed.size === 0) {
    return false;
  }
  return allowed.has(email.toLowerCase());
}
