/**
 * Wallet helpers — call Supabase RPC functions for ACID wallet operations.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createSocialPayInvoice } from '@/modules/payment/socialpay';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function debitWallet(
  userId: string,
  amount: number,
  orderId: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  const admin = getAdminClient();
  const idempotencyKey = `debit:${orderId}`;

  const { data, error } = await admin.rpc('wallet_debit', {
    p_user_id: userId,
    p_amount: amount,
    p_reference_id: orderId,
    p_idempotency_key: idempotencyKey,
    p_description: `Order payment: ${orderId}`,
  });

  if (error) {
    console.error('[wallet] debit RPC error:', error);
    return { success: false, error: error.message };
  }

  const result = data as { success: boolean; error?: string; new_balance?: number; idempotent?: boolean };
  if (!result.success) {
    return { success: false, error: result.error ?? 'Debit failed' };
  }

  return { success: true, newBalance: result.new_balance };
}

export async function creditWallet(
  userId: string,
  amount: number,
  ref: string,
  type: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const admin = getAdminClient();
  const idempotencyKey = `credit:${type}:${ref}`;

  const { data, error } = await admin.rpc('wallet_credit', {
    p_user_id: userId,
    p_amount: amount,
    p_reference_id: ref,
    p_idempotency_key: idempotencyKey,
    p_type: type,
    p_description: `Wallet ${type}: ${ref}`,
  });

  if (error) {
    console.error('[wallet] credit RPC error:', error);
    return { success: false, error: error.message };
  }

  const result = data as { success: boolean; new_balance?: number };
  return { success: result.success, newBalance: result.new_balance };
}

export async function getOrCreateWallet(
  userId: string
): Promise<{ balance: number; currency: string }> {
  const admin = getAdminClient();

  // Try to get existing wallet
  const { data: existing } = await admin
    .from('wallets')
    .select('balance, currency')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return { balance: Number(existing.balance), currency: existing.currency };
  }

  // Create wallet
  const { data: created } = await admin
    .from('wallets')
    .insert({ user_id: userId, balance: 0, currency: 'MNT' })
    .select('balance, currency')
    .single();

  return { balance: Number(created?.balance ?? 0), currency: created?.currency ?? 'MNT' };
}

export async function getUserWallet(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

export async function getWalletTransactions(walletId: string, limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function createSocialPayTopup(amount: number): Promise<{
  success: boolean;
  invoiceId?: string;
  paymentUrl?: string;
  qrCode?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Нэвтэрч орно уу' };
  }

  if (!amount || amount < 1000) {
    return { success: false, error: 'Хамгийн багадаа ₮1,000 оруулна уу' };
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const externalId = `topup-${user.id.slice(0, 8)}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const result = await createSocialPayInvoice({
    amount,
    description: `Хэтэвч цэнэглэлт ₮${amount.toLocaleString()}`,
    externalId,
    returnUrl: `${appUrl}/app/wallet/topup?status=paid`,
  });

  if (!result.success || !result.data) {
    return { success: false, error: result.error ?? 'SocialPay invoice үүсгэхэд алдаа гарлаа' };
  }

  const invoice = result.data;

  // Persist to DB (best-effort — don't fail if insert errors)
  await admin
    .from('socialpay_invoices')
    .insert({
      user_id: user.id,
      order_id: null,
      invoice_id: invoice.invoiceId,
      amount,
      description: invoice.description,
      external_id: externalId,
      payment_url: invoice.paymentUrl,
      qr_code: invoice.qrCode ?? null,
      status: 'pending',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .single();

  return {
    success: true,
    invoiceId: invoice.invoiceId,
    paymentUrl: invoice.paymentUrl,
    qrCode: invoice.qrCode,
  };
}
