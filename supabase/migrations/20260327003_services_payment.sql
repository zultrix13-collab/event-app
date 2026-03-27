-- =====================
-- SERVICES
-- =====================

-- Marketplace products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  description_en text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'MNT',
  image_url text,
  category text DEFAULT 'general' CHECK (category IN ('merchandise', 'food', 'ticket', 'other')),
  stock_count int DEFAULT -1, -- -1 = unlimited
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'MNT',
  payment_method text,
  payment_ref text, -- QPay/SocialPay transaction ref
  notes text,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  cancelled_at timestamptz
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL, -- snapshot
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  total_price numeric(12,2) NOT NULL
);

-- Digital wallet
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'MNT',
  updated_at timestamptz DEFAULT now()
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('topup', 'purchase', 'refund', 'transfer')),
  amount numeric(12,2) NOT NULL,
  balance_before numeric(12,2) NOT NULL,
  balance_after numeric(12,2) NOT NULL,
  reference_id text, -- order_id or payment_ref
  idempotency_key text UNIQUE, -- prevent double processing
  description text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_idem ON wallet_transactions(idempotency_key);

-- Transport bookings
CREATE TABLE IF NOT EXISTS transport_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text DEFAULT 'taxi' CHECK (type IN ('taxi', 'rental', 'shuttle', 'airport_transfer')),
  pickup_location text,
  dropoff_location text,
  pickup_time timestamptz,
  flight_number text, -- for airport transfers
  passenger_count int DEFAULT 1,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  provider_ref text,
  notes text,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now()
);

-- Restaurant bookings
CREATE TABLE IF NOT EXISTS restaurant_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  restaurant_name text NOT NULL,
  table_qr_code text, -- QR code for table
  booking_time timestamptz NOT NULL,
  party_size int DEFAULT 1,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  special_requests text,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now()
);

-- Restaurants list
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  cuisine_type text,
  location text,
  opening_hours jsonb,
  image_url text,
  qr_table_prefix text, -- prefix for table QR codes
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Hotels list
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  address text,
  stars int CHECK (stars BETWEEN 1 AND 5),
  image_url text,
  booking_url text, -- external booking link
  phone text,
  distance_km numeric(5,2), -- from venue
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Lost & Found
CREATE TABLE IF NOT EXISTS lost_found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text DEFAULT 'lost' CHECK (type IN ('lost', 'found')),
  item_name text NOT NULL,
  description text,
  image_url text,
  last_seen_location text,
  contact_info text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- QPay payment invoices
CREATE TABLE IF NOT EXISTS qpay_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invoice_id text UNIQUE, -- QPay invoice ID
  qr_text text, -- QPay QR data
  qr_image text, -- Base64 QR image
  amount numeric(12,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  expires_at timestamptz,
  paid_at timestamptz,
  callback_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE qpay_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read restaurants" ON restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Public read hotels" ON hotels FOR SELECT USING (is_active = true);

CREATE POLICY "Users manage own orders" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own wallet" ON wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own transport" ON transport_bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own restaurant booking" ON restaurant_bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own lost found" ON lost_found_items FOR ALL USING (auth.uid() = reporter_id);
CREATE POLICY "Public can view found items" ON lost_found_items FOR SELECT USING (type = 'found' AND status = 'open');
CREATE POLICY "Users read own qpay invoices" ON qpay_invoices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage restaurants" ON restaurants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage hotels" ON hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage lost found" ON lost_found_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);

-- Wallet debit function (ACID)
CREATE OR REPLACE FUNCTION wallet_debit(
  p_user_id uuid,
  p_amount numeric,
  p_reference_id text,
  p_idempotency_key text,
  p_description text DEFAULT ''
) RETURNS jsonb AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_tx_id uuid;
BEGIN
  -- Idempotency check
  IF EXISTS (SELECT 1 FROM wallet_transactions WHERE idempotency_key = p_idempotency_key) THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true);
  END IF;

  -- Lock wallet row
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  IF v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Debit
  UPDATE wallets SET balance = balance - p_amount, updated_at = now() WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_before, balance_after, reference_id, idempotency_key, description)
  VALUES (v_wallet.id, p_user_id, 'purchase', p_amount, v_wallet.balance, v_wallet.balance - p_amount, p_reference_id, p_idempotency_key, p_description)
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_wallet.balance - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Wallet credit function
CREATE OR REPLACE FUNCTION wallet_credit(
  p_user_id uuid,
  p_amount numeric,
  p_reference_id text,
  p_idempotency_key text,
  p_type text DEFAULT 'topup',
  p_description text DEFAULT ''
) RETURNS jsonb AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_tx_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM wallet_transactions WHERE idempotency_key = p_idempotency_key) THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true);
  END IF;

  INSERT INTO wallets (user_id, balance) VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id FOR UPDATE;

  UPDATE wallets SET balance = balance + p_amount, updated_at = now() WHERE user_id = p_user_id;

  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_before, balance_after, reference_id, idempotency_key, description)
  VALUES (v_wallet.id, p_user_id, p_type, p_amount, v_wallet.balance, v_wallet.balance + p_amount, p_reference_id, p_idempotency_key, p_description)
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_wallet.balance + p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
