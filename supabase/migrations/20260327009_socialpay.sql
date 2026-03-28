-- Add socialpay_invoices table
CREATE TABLE IF NOT EXISTS socialpay_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invoice_id text,
  amount numeric(12,2) NOT NULL,
  description text,
  external_id text,
  payment_url text,
  qr_code text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  expires_at timestamptz,
  paid_at timestamptz,
  callback_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE socialpay_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON socialpay_invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service manages invoices" ON socialpay_invoices
  FOR ALL USING (true);
