-- Add idempotency_key to wallet_transactions if not present
ALTER TABLE wallet_transactions
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS reference_id uuid,
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE wallet_transactions
  ADD CONSTRAINT IF NOT EXISTS wallet_transactions_idempotency_unique UNIQUE (idempotency_key);

ALTER TABLE wallet_transactions
  DROP CONSTRAINT IF EXISTS wallet_transactions_amount_positive;
ALTER TABLE wallet_transactions
  ADD CONSTRAINT wallet_transactions_amount_positive CHECK (amount > 0);

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Atomic wallet transaction function
-- NOTE: wallet_transactions requires wallet_id, balance_before, balance_after
-- so we look up the wallet row and include those fields.
CREATE OR REPLACE FUNCTION process_wallet_transaction(
  p_user_id uuid,
  p_type text,
  p_amount numeric,
  p_idempotency_key text,
  p_reference_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wallet RECORD;
  v_tx_id uuid;
  v_new_balance numeric;
BEGIN
  -- Idempotency check
  SELECT id INTO v_tx_id FROM wallet_transactions
    WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN
    SELECT balance INTO v_new_balance FROM wallets WHERE user_id = p_user_id;
    RETURN json_build_object(
      'success', true,
      'idempotent', true,
      'transaction_id', v_tx_id,
      'balance', v_new_balance
    );
  END IF;

  -- Lock wallet row
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance, currency)
      VALUES (p_user_id, 0, 'MNT')
      RETURNING * INTO v_wallet;
  END IF;

  -- Balance check for deductions
  IF p_type IN ('purchase', 'transfer') THEN
    IF v_wallet.balance < p_amount THEN
      RETURN json_build_object('success', false, 'error', 'Үлдэгдэл хүрэлцэхгүй байна');
    END IF;
  END IF;

  -- Calculate new balance
  IF p_type IN ('topup', 'refund') THEN
    v_new_balance := v_wallet.balance + p_amount;
  ELSE
    v_new_balance := v_wallet.balance - p_amount;
  END IF;

  -- Insert transaction (include wallet_id, balance_before, balance_after)
  INSERT INTO wallet_transactions (
    wallet_id,
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    idempotency_key,
    reference_id,
    description
  ) VALUES (
    v_wallet.id,
    p_user_id,
    p_type,
    p_amount,
    v_wallet.balance,
    v_new_balance,
    p_idempotency_key,
    p_reference_id,
    p_description
  )
  RETURNING id INTO v_tx_id;

  -- Update balance atomically
  UPDATE wallets
    SET balance = v_new_balance, updated_at = now()
    WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'balance', v_new_balance,
    'type', p_type
  );
END;
$$;

GRANT EXECUTE ON FUNCTION process_wallet_transaction(uuid, text, numeric, text, uuid, text) TO authenticated;
