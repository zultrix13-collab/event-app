import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { creditWallet } from '@/modules/payment/wallet';

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const admin = getAdmin();

    // Extract invoice ID from callback payload
    const invoiceId =
      (typeof body.invoice_id === 'string' && body.invoice_id) ||
      (typeof body.qpay_invoice_id === 'string' && body.qpay_invoice_id) ||
      null;

    if (!invoiceId) {
      console.warn('[qpay-callback] Missing invoice_id in payload:', JSON.stringify(body).slice(0, 200));
      return NextResponse.json({ ok: true }); // Return 200 to prevent QPay retries
    }

    // Look up invoice
    const { data: invoice } = await admin
      .from('qpay_invoices')
      .select('*')
      .eq('invoice_id', invoiceId)
      .single();

    if (!invoice) {
      console.warn('[qpay-callback] Invoice not found:', invoiceId);
      return NextResponse.json({ ok: true });
    }

    if (invoice.status === 'paid') {
      // Already processed — idempotent
      return NextResponse.json({ ok: true });
    }

    // Mark invoice as paid
    await admin
      .from('qpay_invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        callback_data: body,
      })
      .eq('invoice_id', invoiceId);

    // Handle based on whether it's a topup (no order) or order payment
    if (invoice.order_id) {
      // Order payment
      await admin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_ref: invoiceId,
        })
        .eq('id', invoice.order_id)
        .eq('status', 'pending');
    } else if (invoice.user_id) {
      // Wallet topup
      await creditWallet(
        invoice.user_id,
        Number(invoice.amount),
        invoiceId,
        'topup'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[qpay-callback] Error:', err);
    // Return 200 anyway to prevent endless retries
    return NextResponse.json({ ok: true });
  }
}
