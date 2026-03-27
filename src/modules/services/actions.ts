'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { qpayCreateInvoice, qpayCheckPayment } from '@/modules/payment/qpay';
import { debitWallet, creditWallet } from '@/modules/payment/wallet';
import type {
  ServiceActionResult,
  CreateOrderInput,
  TransportBookingInput,
  RestaurantBookingInput,
  LostFoundInput,
  Product,
  Order,
  WalletTransaction,
  Wallet,
  QPayInvoice,
  TransportBooking,
  RestaurantBooking,
  LostFoundItem,
  Restaurant,
  Hotel,
} from './types';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user;
}

// ─── CIRCUIT BREAKER ─────────────────────────────────────────────────────────
let qpayFailureCount = 0;
let qpayCircuitOpenUntil = 0;
const CIRCUIT_THRESHOLD = 3;
const CIRCUIT_RESET_MS = 60_000;

function qpayCircuitAllow(): boolean {
  if (Date.now() < qpayCircuitOpenUntil) return false;
  return true;
}

function qpayCircuitSuccess() {
  qpayFailureCount = 0;
  qpayCircuitOpenUntil = 0;
}

function qpayCircuitFailure() {
  qpayFailureCount++;
  if (qpayFailureCount >= CIRCUIT_THRESHOLD) {
    qpayCircuitOpenUntil = Date.now() + CIRCUIT_RESET_MS;
  }
}

// ─── MARKETPLACE ─────────────────────────────────────────────────────────────

export async function getProducts(
  category?: string
): Promise<ServiceActionResult<Product[]>> {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category as 'merchandise' | 'food' | 'ticket' | 'other');
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Product[] };
}

export async function createOrder(
  input: CreateOrderInput
): Promise<ServiceActionResult<Order>> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const admin = getAdminClient();

  // Fetch products
  const productIds = input.items.map((i) => i.productId);
  const { data: productsRaw, error: pErr } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('is_active', true);

  const products = (productsRaw ?? []) as Product[];
  if (pErr) return { success: false, error: pErr.message };

  // Calculate total
  let totalAmount = 0;
  const orderItems: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }> = [];

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { success: false, error: `Product ${item.productId} not found` };

    // Check stock
    if (product.stock_count !== -1 && product.stock_count < item.quantity) {
      return { success: false, error: `Insufficient stock for ${product.name}` };
    }

    const lineTotal = Number(product.price) * item.quantity;
    totalAmount += lineTotal;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: Number(product.price),
      total_price: lineTotal,
    });
  }

  // Create order
  const { data: order, error: oErr } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_amount: totalAmount,
      currency: 'MNT',
      payment_method: input.paymentMethod,
    })
    .select()
    .single();

  if (oErr || !order) return { success: false, error: oErr?.message ?? 'Failed to create order' };

  // Create order items
  const { error: itemErr } = await admin
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemErr) return { success: false, error: itemErr.message };

  // Deduct stock
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product && product.stock_count !== -1) {
      await admin
        .from('products')
        .update({ stock_count: product.stock_count - item.quantity })
        .eq('id', product.id);
    }
  }

  // If wallet payment, debit immediately
  if (input.paymentMethod === 'wallet') {
    const result = await debitWallet(user.id, totalAmount, order.id);
    if (!result.success) {
      // Rollback order
      await admin.from('orders').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', order.id);
      return { success: false, error: result.error ?? 'Wallet payment failed' };
    }
    // Mark order as paid
    await admin.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id);
  }

  revalidatePath('/app/services/shop/orders');
  return { success: true, data: order as Order };
}

export async function cancelOrder(
  orderId: string
): Promise<ServiceActionResult> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) return { success: false, error: 'Order not found' };
  if (order.status !== 'pending') return { success: false, error: 'Cannot cancel non-pending order' };

  const { error } = await admin
    .from('orders')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/app/services/shop/orders');
  return { success: true };
}

export async function getUserOrders(): Promise<ServiceActionResult<Order[]>> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as unknown as Order[] };
}

// ─── WALLET ───────────────────────────────────────────────────────────────────

export async function getWallet(): Promise<
  ServiceActionResult<{ wallet: Wallet | null; transactions: WalletTransaction[] }>
> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!wallet) {
    return { success: true, data: { wallet: null, transactions: [] } };
  }

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', wallet.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    success: true,
    data: {
      wallet: wallet as Wallet,
      transactions: (transactions ?? []) as WalletTransaction[],
    },
  };
}

export async function topupWallet(
  amount: number
): Promise<ServiceActionResult<QPayInvoice>> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  if (!qpayCircuitAllow()) {
    return { success: false, error: 'Төлбөрийн систем түр хаагдсан. Дахин оролдоно уу.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const senderInvoiceNo = `topup-${user.id.slice(0, 8)}-${Date.now()}`;

  try {
    const result = await qpayCreateInvoice({
      senderInvoiceNo,
      invoiceReceiverCode: user.id.slice(0, 12),
      amount,
      description: `Хэтэвч цэнэглэлт ₮${amount.toLocaleString()}`,
      callbackUrl: `${appUrl}/api/payment/qpay-callback`,
    });

    qpayCircuitSuccess();

    // Store invoice (no order for topup — order_id = null)
    const { data: invoice, error: invErr } = await admin
      .from('qpay_invoices')
      .insert({
        user_id: user.id,
        order_id: null,
        invoice_id: result.invoiceId,
        qr_text: result.qrText,
        qr_image: result.qrImage,
        amount,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (invErr || !invoice) return { success: false, error: 'Failed to store invoice' };

    return { success: true, data: invoice as QPayInvoice };
  } catch (err) {
    qpayCircuitFailure();
    console.error('[qpay] topupWallet error:', err);
    return { success: false, error: 'QPay холболт амжилтгүй боллоо. Дахин оролдоно уу.' };
  }
}

export async function payWithWallet(
  orderId: string
): Promise<ServiceActionResult> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) return { success: false, error: 'Order not found' };
  if (order.status !== 'pending') return { success: false, error: 'Order already processed' };

  const result = await debitWallet(user.id, Number(order.total_amount), orderId);
  if (!result.success) return result;

  await admin
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'wallet' })
    .eq('id', orderId);

  revalidatePath('/app/services/shop/orders');
  revalidatePath('/app/wallet');
  return { success: true };
}

// ─── QPAY ────────────────────────────────────────────────────────────────────

export async function createQPayInvoice(
  orderId: string,
  amount: number
): Promise<ServiceActionResult<QPayInvoice>> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  if (!qpayCircuitAllow()) {
    return { success: false, error: 'Төлбөрийн систем түр хаагдсан.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    const result = await qpayCreateInvoice({
      senderInvoiceNo: orderId.slice(0, 20),
      invoiceReceiverCode: user.id.slice(0, 12),
      amount,
      description: `Order ${orderId}`,
      callbackUrl: `${appUrl}/api/payment/qpay-callback`,
    });

    qpayCircuitSuccess();

    const { data: invoice, error: invErr } = await admin
      .from('qpay_invoices')
      .insert({
        order_id: orderId,
        user_id: user.id,
        invoice_id: result.invoiceId,
        qr_text: result.qrText,
        qr_image: result.qrImage,
        amount,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (invErr || !invoice) return { success: false, error: 'Failed to store invoice' };

    return { success: true, data: invoice as QPayInvoice };
  } catch (err) {
    qpayCircuitFailure();
    console.error('[qpay] createQPayInvoice error:', err);
    return { success: false, error: 'QPay холболт амжилтгүй боллоо.' };
  }
}

export async function checkQPayStatus(
  invoiceId: string
): Promise<ServiceActionResult<{ isPaid: boolean; status: string }>> {
  const admin = getAdminClient();

  // Check DB first
  const { data: dbInvoice } = await admin
    .from('qpay_invoices')
    .select('*')
    .eq('invoice_id', invoiceId)
    .single();

  if (dbInvoice?.status === 'paid') {
    return { success: true, data: { isPaid: true, status: 'paid' } };
  }

  if (!qpayCircuitAllow()) {
    return { success: true, data: { isPaid: false, status: dbInvoice?.status ?? 'pending' } };
  }

  try {
    const result = await qpayCheckPayment(invoiceId);
    qpayCircuitSuccess();

    if (result.isPaid && dbInvoice) {
      await admin
        .from('qpay_invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('invoice_id', invoiceId);

      // Update order if exists
      if (dbInvoice.order_id) {
        await admin
          .from('orders')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', dbInvoice.order_id);
      }

      // Credit wallet if topup
      if (!dbInvoice.order_id && dbInvoice.user_id) {
        await creditWallet(dbInvoice.user_id, Number(dbInvoice.amount), invoiceId, 'topup');
      }
    }

    return { success: true, data: { isPaid: result.isPaid, status: result.isPaid ? 'paid' : 'pending' } };
  } catch (err) {
    qpayCircuitFailure();
    console.error('[qpay] checkQPayStatus error:', err);
    return { success: true, data: { isPaid: false, status: dbInvoice?.status ?? 'pending' } };
  }
}

// ─── TRANSPORT ───────────────────────────────────────────────────────────────

export async function bookTransport(
  data: TransportBookingInput
): Promise<ServiceActionResult<TransportBooking>> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  const { data: booking, error } = await admin
    .from('transport_bookings')
    .insert({
      user_id: user.id,
      type: data.type,
      pickup_location: data.pickup_location,
      dropoff_location: data.dropoff_location ?? null,
      pickup_time: data.pickup_time,
      flight_number: data.flight_number ?? null,
      passenger_count: data.passenger_count,
      notes: data.notes ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/app/services/transport');
  return { success: true, data: booking as TransportBooking };
}

export async function cancelTransport(bookingId: string): Promise<ServiceActionResult> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  const { error } = await admin
    .from('transport_bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/app/services/transport');
  return { success: true };
}

export async function getUserTransportBookings(): Promise<ServiceActionResult<TransportBooking[]>> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transport_bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as TransportBooking[] };
}

// ─── RESTAURANT ──────────────────────────────────────────────────────────────

export async function getRestaurants(): Promise<ServiceActionResult<Restaurant[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Restaurant[] };
}

export async function bookRestaurant(
  data: RestaurantBookingInput
): Promise<ServiceActionResult<RestaurantBooking>> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  const { data: booking, error } = await admin
    .from('restaurant_bookings')
    .insert({
      user_id: user.id,
      restaurant_name: data.restaurant_name,
      booking_time: data.booking_time,
      party_size: data.party_size,
      special_requests: data.special_requests ?? null,
      table_qr_code: data.table_qr_code ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/app/services/restaurant');
  return { success: true, data: booking as RestaurantBooking };
}

export async function cancelRestaurantBooking(bookingId: string): Promise<ServiceActionResult> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  const { error } = await admin
    .from('restaurant_bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/app/services/restaurant');
  return { success: true };
}

export async function getUserRestaurantBookings(): Promise<ServiceActionResult<RestaurantBooking[]>> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('restaurant_bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('booking_time', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as RestaurantBooking[] };
}

// ─── HOTELS ──────────────────────────────────────────────────────────────────

export async function getHotels(): Promise<ServiceActionResult<Hotel[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('is_active', true)
    .order('distance_km', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as Hotel[] };
}

// ─── LOST & FOUND ────────────────────────────────────────────────────────────

export async function reportLostItem(
  data: LostFoundInput
): Promise<ServiceActionResult<LostFoundItem>> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  const { data: item, error } = await admin
    .from('lost_found_items')
    .insert({
      reporter_id: user.id,
      type: data.type,
      item_name: data.item_name,
      description: data.description ?? null,
      last_seen_location: data.last_seen_location ?? null,
      contact_info: data.contact_info ?? null,
      image_url: data.image_url ?? null,
      status: 'open',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/app/services/lost-found');
  return { success: true, data: item as LostFoundItem };
}

export async function getOpenItems(
  type?: 'lost' | 'found'
): Promise<ServiceActionResult<LostFoundItem[]>> {
  const supabase = await createClient();
  let query = supabase
    .from('lost_found_items')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as LostFoundItem[] };
}

export async function updateItemStatus(
  itemId: string,
  status: string
): Promise<ServiceActionResult> {
  const user = await getCurrentUser();
  const admin = getAdminClient();

  // Admin-only: check role
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'specialist'].includes(profile.role ?? '')) {
    return { success: false, error: 'Insufficient permissions' };
  }

  const updateData: Record<string, unknown> = { status };
  if (status === 'resolved') {
    updateData.resolved_by = user.id;
    updateData.resolved_at = new Date().toISOString();
  }

  const { error } = await admin
    .from('lost_found_items')
    .update(updateData)
    .eq('id', itemId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/services/lost-found');
  return { success: true };
}
