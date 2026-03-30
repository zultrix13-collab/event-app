'use server';

/**
 * checkout.ts — Shop checkout server action
 * Wallet ACID deduction + order creation in one flow.
 */

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { deductFromWallet } from '@/modules/payment/wallet';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface CheckoutItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function checkoutCart(
  userId: string,
  items: CheckoutItem[],
  totalAmount: number
): Promise<CheckoutResult> {
  if (!items.length) {
    return { success: false, error: 'Сагс хоосон байна' };
  }
  if (totalAmount <= 0) {
    return { success: false, error: 'Нийт дүн буруу байна' };
  }

  const idempotencyKey = crypto.randomUUID();
  const admin = getAdminClient();

  // 1. Wallet deduction via ACID RPC
  const walletResult = await deductFromWallet(
    userId,
    totalAmount,
    `Захиалга: ${items.map((i) => i.productName).join(', ')}`,
    `purchase:${idempotencyKey}`
  );

  if (!walletResult.success) {
    return { success: false, error: walletResult.error };
  }

  // 2. Create order
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      status: 'paid',
      total_amount: totalAmount,
      currency: 'MNT',
      payment_method: 'wallet',
      payment_ref: idempotencyKey,
      paid_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[checkout] order insert error:', orderError);
    return { success: false, error: 'Захиалга үүсгэхэд алдаа гарлаа' };
  }

  const orderId = order.id as string;

  // 3. Insert order_items
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }));

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('[checkout] order_items insert error:', itemsError);
    // Order already created — return partial success with orderId
    return { success: true, orderId, error: 'Захиалгын дэлгэрэнгүй хадгалахад алдаа гарлаа' };
  }

  // 4. Update stock_count for limited items
  for (const item of items) {
    // Only update if stockCount is not unlimited (-1)
    await admin.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    }).then(({ error }) => {
      if (error) {
        // Non-critical: log but don't fail the order
        console.warn('[checkout] stock decrement failed for', item.productId, error.message);
      }
    });
  }

  return { success: true, orderId };
}

/**
 * Server action wrapper for use in client components.
 */
export async function checkoutCartAction(
  items: CheckoutItem[],
  totalAmount: number
): Promise<CheckoutResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Нэвтрэч орно уу' };
  }

  return checkoutCart(user.id, items, totalAmount);
}
