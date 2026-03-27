// Services module types

export type ProductCategory = 'merchandise' | 'food' | 'ticket' | 'other';

export interface Product {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  category: ProductCategory;
  stock_count: number; // -1 = unlimited
  is_active: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Cart state (client-side only)
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

export type WalletTransactionType = 'topup' | 'purchase' | 'refund' | 'transfer';

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string | null;
  type: WalletTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_id: string | null;
  idempotency_key: string | null;
  description: string | null;
  created_at: string;
}

export type TransportType = 'taxi' | 'rental' | 'shuttle' | 'airport_transfer';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface TransportBooking {
  id: string;
  user_id: string | null;
  type: TransportType;
  pickup_location: string | null;
  dropoff_location: string | null;
  pickup_time: string | null;
  flight_number: string | null;
  passenger_count: number;
  status: BookingStatus;
  provider_ref: string | null;
  notes: string | null;
  order_id: string | null;
  created_at: string;
}

export interface TransportBookingInput {
  type: TransportType;
  pickup_location: string;
  dropoff_location?: string;
  pickup_time: string;
  flight_number?: string;
  passenger_count: number;
  notes?: string;
}

export type RestaurantBookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface RestaurantBooking {
  id: string;
  user_id: string | null;
  restaurant_name: string;
  table_qr_code: string | null;
  booking_time: string;
  party_size: number;
  status: RestaurantBookingStatus;
  special_requests: string | null;
  order_id: string | null;
  created_at: string;
}

export interface RestaurantBookingInput {
  restaurant_name: string;
  booking_time: string;
  party_size: number;
  special_requests?: string;
  table_qr_code?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  cuisine_type: string | null;
  location: string | null;
  opening_hours: Record<string, string> | null;
  image_url: string | null;
  qr_table_prefix: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Hotel {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  address: string | null;
  stars: number | null;
  image_url: string | null;
  booking_url: string | null;
  phone: string | null;
  distance_km: number | null;
  is_active: boolean;
  created_at: string;
}

export type LostFoundType = 'lost' | 'found';
export type LostFoundStatus = 'open' | 'resolved' | 'closed';

export interface LostFoundItem {
  id: string;
  reporter_id: string | null;
  type: LostFoundType;
  item_name: string;
  description: string | null;
  image_url: string | null;
  last_seen_location: string | null;
  contact_info: string | null;
  status: LostFoundStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface LostFoundInput {
  type: LostFoundType;
  item_name: string;
  description?: string;
  last_seen_location?: string;
  contact_info?: string;
  image_url?: string;
}

export type QPayInvoiceStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

export interface QPayInvoice {
  id: string;
  order_id: string | null;
  user_id: string | null;
  invoice_id: string | null;
  qr_text: string | null;
  qr_image: string | null;
  amount: number;
  status: QPayInvoiceStatus;
  expires_at: string | null;
  paid_at: string | null;
  callback_data: Record<string, unknown> | null;
  created_at: string;
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  paymentMethod: string;
}

export interface ServiceActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
