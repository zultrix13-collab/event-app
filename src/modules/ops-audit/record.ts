/**
 * Operator/support action audit (service role). No user-facing RLS — internal ops tooling only.
 */
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export async function recordOperatorAuditEvent(params: {
  actorEmail: string;
  actionType: string;
  organizationId?: string | null;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("operator_audit_events").insert({
    actor_email: params.actorEmail,
    action_type: params.actionType,
    organization_id: params.organizationId ?? null,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    metadata: (params.metadata ?? {}) as unknown as Json
  });

  if (error) {
    throw error;
  }
}
