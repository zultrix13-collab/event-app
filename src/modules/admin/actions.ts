"use server";

import { revalidatePath } from "next/cache";
import { requireOperatorMutationActor } from "@/modules/admin/guard";
import { safeRecordOperatorAuditEvent } from "@/modules/ops-audit/record";
import { runInvoicePaymentReverification } from "@/modules/billing/reconciliation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type OperatorActionState = {
  error?: string;
  message?: string;
};

export async function operatorReverifyInvoiceAction(
  _prev: OperatorActionState,
  formData: FormData
): Promise<OperatorActionState> {
  const actor = await requireOperatorMutationActor();
  const invoiceId = formData.get("invoiceId");
  if (typeof invoiceId !== "string" || !invoiceId) {
    return { error: "Invalid invoice." };
  }

  const admin = getSupabaseAdminClient();
  const { data: invRow, error: invErr } = await admin
    .from("invoices")
    .select("organization_id")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invErr || !invRow) {
    return { error: "Invoice not found." };
  }

  try {
    const result = await runInvoicePaymentReverification({ invoiceId, actorEmail: actor });

    await safeRecordOperatorAuditEvent({
      actorEmail: actor,
      actionType: "invoice_payment_reverification",
      organizationId: invRow.organization_id,
      resourceType: "invoice",
      resourceId: invoiceId,
      metadata: { verify_result: result.status }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/billing");
    revalidatePath("/admin/audit");
    return { message: `Verification finished: ${result.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reverification failed.";
    await safeRecordOperatorAuditEvent({
      actorEmail: actor,
      actionType: "invoice_payment_reverification",
      organizationId: invRow.organization_id,
      resourceType: "invoice",
      resourceId: invoiceId,
      metadata: { outcome: "error", error: msg }
    });
    return { error: msg };
  }
}

/**
 * Domain-specific job retry actions энд нэмнэ.
 * Жишээ: operatorRetryJobAction(jobId: string) → execute + audit + revalidate
 */
