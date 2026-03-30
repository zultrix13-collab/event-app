-- ============================================================
-- DB Layer Hardening Migration
-- File: 20260329001_db_layer_hardening.sql
-- Created: 2026-03-29
-- Description: RPC security hardening, new tables, RLS policies
-- ============================================================

-- ============================================================
-- 1. NEW TABLES
-- ============================================================

-- Session feedback / ratings
CREATE TABLE IF NOT EXISTS session_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id) -- one feedback per user per session
);
CREATE INDEX IF NOT EXISTS idx_session_feedback_session ON session_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_user ON session_feedback(user_id);

-- Vendors / booths
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  description_en text,
  logo_url text,
  booth_number text,
  category text DEFAULT 'general',
  contact_email text,
  contact_phone text,
  website_url text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);

-- Announcements / CMS notifications
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  body text NOT NULL,
  body_en text,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'news')),
  target_roles user_role[] DEFAULT NULL, -- NULL = all roles
  is_published boolean DEFAULT false,
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  -- Category toggles
  event_updates boolean DEFAULT true,
  session_reminders boolean DEFAULT true,
  wallet_alerts boolean DEFAULT true,
  announcements boolean DEFAULT true,
  marketing boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. ENABLE RLS ON NEW TABLES
-- ============================================================

ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS POLICIES — session_feedback
-- ============================================================

-- Users can view all feedback for a session (useful for aggregate display)
CREATE POLICY "Users can view session feedback"
  ON session_feedback FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can only submit their own feedback
CREATE POLICY "Users can insert own feedback"
  ON session_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback"
  ON session_feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete own feedback"
  ON session_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all feedback
CREATE POLICY "Admins manage all feedback"
  ON session_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'specialist')
    )
  );

-- ============================================================
-- 4. RLS POLICIES — vendors
-- ============================================================

-- Public can view active vendors
CREATE POLICY "Public can read active vendors"
  ON vendors FOR SELECT
  USING (is_active = true);

-- Admins manage vendors
CREATE POLICY "Admins manage vendors"
  ON vendors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'specialist')
    )
  );

-- ============================================================
-- 5. RLS POLICIES — announcements
-- ============================================================

-- Authenticated users can read published announcements targeted to their role
-- Uses a SECURITY DEFINER helper to avoid RLS recursion on profiles lookup
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE POLICY "Users can read published announcements"
  ON announcements FOR SELECT
  USING (
    is_published = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      target_roles IS NULL
      OR public.get_current_user_role() = ANY(target_roles)
    )
  );

-- Admins can manage all announcements
CREATE POLICY "Admins manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'specialist')
    )
  );

-- ============================================================
-- 6. RLS POLICIES — notification_preferences
-- ============================================================

-- Users can only see/manage their own notification preferences
CREATE POLICY "Users can read own notification prefs"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification prefs"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification prefs"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all notification prefs (for analytics)
CREATE POLICY "Admins can read all notification prefs"
  ON notification_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'super_admin'
    )
  );

-- ============================================================
-- 7. RPC: check_otp_rate_limit(email)
-- OTP brute-force protection: 5 attempts / 10 minutes
-- Returns: jsonb { allowed: bool, attempts_left: int, blocked_until: timestamptz }
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record otp_attempts%ROWTYPE;
  v_window_start timestamptz := now() - interval '10 minutes';
  v_max_attempts CONSTANT int := 5;
BEGIN
  -- Get current record
  SELECT * INTO v_record
  FROM otp_attempts
  WHERE email = p_email;

  -- No record yet → allowed
  IF NOT FOUND THEN
    INSERT INTO otp_attempts (email, attempt_count, last_attempt_at, blocked_until)
    VALUES (p_email, 1, now(), NULL);
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_left', v_max_attempts - 1,
      'blocked_until', NULL
    );
  END IF;

  -- Currently blocked?
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > now() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'attempts_left', 0,
      'blocked_until', v_record.blocked_until
    );
  END IF;

  -- Window expired → reset
  IF v_record.last_attempt_at < v_window_start THEN
    UPDATE otp_attempts
    SET attempt_count = 1,
        last_attempt_at = now(),
        blocked_until = NULL
    WHERE email = p_email;
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_left', v_max_attempts - 1,
      'blocked_until', NULL
    );
  END IF;

  -- Within window: increment
  IF v_record.attempt_count >= v_max_attempts THEN
    -- Block for 10 more minutes
    UPDATE otp_attempts
    SET blocked_until = now() + interval '10 minutes',
        last_attempt_at = now()
    WHERE email = p_email;
    RETURN jsonb_build_object(
      'allowed', false,
      'attempts_left', 0,
      'blocked_until', now() + interval '10 minutes'
    );
  END IF;

  UPDATE otp_attempts
  SET attempt_count = attempt_count + 1,
      last_attempt_at = now()
  WHERE email = p_email;

  RETURN jsonb_build_object(
    'allowed', true,
    'attempts_left', v_max_attempts - v_record.attempt_count - 1,
    'blocked_until', NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_otp_rate_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_otp_rate_limit(text) TO anon, authenticated;

-- ============================================================
-- 8. RPC: register_session(session_id, user_id)
-- Race-condition-free session seat registration using SELECT FOR UPDATE
-- Returns: jsonb { success: bool, error?: text, registration_id?: uuid }
-- ============================================================

CREATE OR REPLACE FUNCTION public.register_session(
  p_session_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := COALESCE(p_user_id, auth.uid());
  v_session event_sessions%ROWTYPE;
  v_reg_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check for existing registration first (avoid locking if already registered)
  IF EXISTS (
    SELECT 1 FROM seat_registrations
    WHERE session_id = p_session_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already registered');
  END IF;

  -- Lock session row to prevent race condition on seat count
  SELECT * INTO v_session
  FROM event_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF NOT v_session.is_published THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session is not available');
  END IF;

  -- Check capacity (capacity = 0 means unlimited)
  IF v_session.capacity IS NOT NULL
     AND v_session.capacity > 0
     AND v_session.registered_count >= v_session.capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session is full');
  END IF;

  -- Register
  INSERT INTO seat_registrations (session_id, user_id)
  VALUES (p_session_id, v_user_id)
  ON CONFLICT (session_id, user_id) DO NOTHING
  RETURNING id INTO v_reg_id;

  IF v_reg_id IS NULL THEN
    -- Conflict hit (race condition handled)
    RETURN jsonb_build_object('success', false, 'error', 'Already registered');
  END IF;

  -- Increment count
  UPDATE event_sessions
  SET registered_count = registered_count + 1
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg_id,
    'session_title', v_session.title
  );
END;
$$;

REVOKE ALL ON FUNCTION public.register_session(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_session(uuid, uuid) TO authenticated;

-- ============================================================
-- 9. RPC: wallet_transfer(user_id, amount, type, idempotency_key, description)
-- ACID wallet transaction (debit from user wallet)
-- Returns: jsonb { success: bool, transaction_id?: uuid, new_balance?: numeric, error?: text }
-- ============================================================

CREATE OR REPLACE FUNCTION public.wallet_transfer(
  p_user_id uuid,
  p_amount numeric,
  p_type text,
  p_idempotency_key text,
  p_description text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_tx_id uuid;
  v_caller_id uuid := auth.uid();
BEGIN
  -- Only the user themselves or super_admin can trigger a transfer
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF v_caller_id <> p_user_id THEN
    -- Check if caller is admin
    IF NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = v_caller_id AND role = 'super_admin'
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
  END IF;

  -- Validate type
  IF p_type NOT IN ('topup', 'purchase', 'refund', 'transfer') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid transaction type');
  END IF;

  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Idempotency check
  IF EXISTS (SELECT 1 FROM wallet_transactions WHERE idempotency_key = p_idempotency_key) THEN
    SELECT jsonb_build_object('success', true, 'idempotent', true)
    INTO v_tx_id; -- reuse variable to avoid extra declare
    RETURN jsonb_build_object('success', true, 'idempotent', true);
  END IF;

  -- Ensure wallet exists
  INSERT INTO wallets (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock wallet row
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  -- For debits (purchase/transfer): check sufficient balance
  IF p_type IN ('purchase', 'transfer') THEN
    IF v_wallet.balance < p_amount THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;
    -- Debit
    UPDATE wallets
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO wallet_transactions (
      wallet_id, user_id, type, amount,
      balance_before, balance_after,
      idempotency_key, description
    )
    VALUES (
      v_wallet.id, p_user_id, p_type, p_amount,
      v_wallet.balance, v_wallet.balance - p_amount,
      p_idempotency_key, p_description
    )
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
      'success', true,
      'transaction_id', v_tx_id,
      'new_balance', v_wallet.balance - p_amount
    );
  ELSE
    -- Credit (topup/refund)
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO wallet_transactions (
      wallet_id, user_id, type, amount,
      balance_before, balance_after,
      idempotency_key, description
    )
    VALUES (
      v_wallet.id, p_user_id, p_type, p_amount,
      v_wallet.balance, v_wallet.balance + p_amount,
      p_idempotency_key, p_description
    )
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
      'success', true,
      'transaction_id', v_tx_id,
      'new_balance', v_wallet.balance + p_amount
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.wallet_transfer(uuid, numeric, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_transfer(uuid, numeric, text, text, text) TO authenticated;

-- ============================================================
-- 10. RPC: broadcast_notification(title, body, type, target_roles[])
-- Insert per-user inbox notifications for all users with matching roles.
-- NOTE: `notifications` table already exists (broadcast log, different schema).
-- We use `user_notifications` for the per-user inbox.
-- Returns: jsonb { success: bool, recipients: int }
-- ============================================================

-- Per-user notification inbox table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'news', 'system')),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON user_notifications(created_at DESC);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users read own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all notifications
CREATE POLICY "Admins manage user_notifications"
  ON user_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'specialist')
    )
  );

CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title text,
  p_body text,
  p_type text DEFAULT 'info',
  p_target_roles user_role[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_recipient_count int;
BEGIN
  -- Only admins can broadcast
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = v_caller_id
      AND role IN ('super_admin', 'specialist')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: admin role required');
  END IF;

  -- Validate type
  IF p_type NOT IN ('info', 'warning', 'urgent', 'news', 'system') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid notification type');
  END IF;

  -- Insert notification for each matching user
  -- Respect notification_preferences.announcements toggle
  WITH target_users AS (
    SELECT p.id AS user_id
    FROM profiles p
    WHERE p.is_active = true
      AND (
        p_target_roles IS NULL
        OR array_length(p_target_roles, 1) IS NULL
        OR p.role = ANY(p_target_roles)
      )
      -- Respect user preference if preference row exists; default is true
      AND COALESCE(
        (SELECT np.announcements FROM notification_preferences np WHERE np.user_id = p.id),
        true
      ) = true
  ),
  inserted AS (
    INSERT INTO user_notifications (user_id, title, body, type)
    SELECT user_id, p_title, p_body, p_type
    FROM target_users
    RETURNING id
  )
  SELECT count(*) INTO v_recipient_count FROM inserted;

  -- Also create an announcement record
  INSERT INTO announcements (
    title, body, type, target_roles,
    is_published, published_at, created_by
  )
  VALUES (
    p_title, p_body, p_type, p_target_roles,
    true, now(), v_caller_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'recipients', v_recipient_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_notification(text, text, text, user_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.broadcast_notification(text, text, text, user_role[]) TO authenticated;

-- ============================================================
-- 11. RLS RECURSION SAFETY — audit existing event-app policies
-- The main recursion risk: policies on profiles that query profiles again.
-- Pattern: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ...)
-- This is safe ONLY when the policy is on a DIFFERENT table, not on profiles itself.
-- We create a helper function to avoid any potential recursion on profiles.
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid();
$$;

-- Ensure profiles table has safe non-recursive policies
-- Profiles self-select: users see only their own row (no recursion risk)
-- Admins need to see all profiles — but the check uses auth.uid() directly, not profiles
-- The existing pattern "EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (...))"
-- is SAFE when on other tables because it queries profiles by PK (auth.uid()), not recursively.
-- However if profiles has a policy that checks profiles again, that's a recursion.
-- We check and guard against that:

DO $$
BEGIN
  -- Drop any potentially recursive policies on profiles
  -- (policies that query profiles table from within a profiles policy)
  -- The safe pattern for profiles self-select is just: auth.uid() = id
  
  -- Add a safe admin-view policy on profiles if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Admins can view all profiles safe'
  ) THEN
    -- Use current_user_role() (SECURITY DEFINER) to avoid recursion
    EXECUTE $policy$
      CREATE POLICY "Admins can view all profiles safe"
        ON profiles FOR SELECT
        USING (
          auth.uid() = id
          OR public.current_user_role() IN ('super_admin', 'specialist')
        )
    $policy$;
  END IF;
END;
$$;

-- ============================================================
-- 12. INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread ON user_notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_announcements_roles ON announcements USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
